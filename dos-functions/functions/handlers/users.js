const { admin, db } = require('../utils/admin');
const config = require('../utils/config');

const firebase = require('firebase');
firebase.initializeApp(config);

const { validateSignupData, validateLoginData } = require('../utils/validators');

// Signup
const noAvatar = 'no-avatar.png';
exports.signup = (req, res) => {
  const newUser = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    userType: req.body.userType,
    organization: req.body.organization,
    avatarUrl: `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${noAvatar}?alt=media`,
    createdAt: new Date().toISOString()
  };

  const { valid, errors } = validateSignupData(newUser);
  if (!valid) return res.status(400).json(errors);

  let token, userId;
  db.doc(`/users/${newUser.email}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        return res.status(400).json({ email: 'This email is already in use' });
      } else {
        return firebase.auth().createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then(data => {
      userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then(idToken => {
      token = idToken;
      const userCredentials = {
        userId,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        userType: newUser.userType,
        organization: newUser.organization,
        avatarUrl: newUser.avatarUrl,
        createdAt: newUser.createdAt
      };
      return db.doc(`/users/${newUser.email}`).set(userCredentials);
    })
    .then(() => {
      return res.status(201).json({ message: `User(${newUser.email}) created successfully`, token });
    })
    .catch(err => {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        return res.status(400).json({ email: 'This email is already in use' });
      } else {
        res.status(500).json({ error: err.code });
      }
    });
};

//Login
exports.login = (req, res) => {
  const user = {
    email: req.body.email,
    password: req.body.password
  };

  const { valid, errors } = validateLoginData(user);
  if (!valid) return res.status(400).json(errors);

  firebase
    .auth()
    .signInWithEmailAndPassword(user.email, user.password)
    .then(data => {
      return data.user.getIdToken();
    })
    .then(token => {
      return res.json({ token });
    })
    .catch(err => {
      console.error(err);
      if (err.code === 'auth/wrong-password') {
        return res.status(403).json({ general: 'Wrong credentials, please try again.' });
      } else if (err.code === 'auth/user-not-found') {
        return res.status(500).json({ user: 'No user found for this email.' });
      } else {
        res.status(500).json({ error: err.code });
      }
    });
};

// Add user details TODO: finish this
exports.addUserDetails = (req, res) => {
  let userDetails = reduceUserDetails(req.body);

  db.doc(`/users/${req.user.handle}`)
    .update(userDetails)
    .then(() => {
      return res.json({ message: 'Details added successfully' });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// Get any user's details
exports.getAnyUser = (req, res) => {
  let userData = {};
  db.doc(`/users/${req.params.email}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        userData.user = doc.data();
        return db
          .collection('projects')
          .where('createdBy', '==', req.params.email)
          .where('collaborators', 'array-contains', req.params.email)
          .orderBy('createdAt', 'desc')
          .get();
      } else {
        return res.status(404).json({ errror: 'User not found' });
      }
    })
    .then(data => {
      userData.projects = [];
      data.forEach(doc => {
        userData.projects.push({
          body: doc.data().body,
          createdAt: doc.data().createdAt,
          userHandle: doc.data().userHandle,
          userImage: doc.data().userImage,
          likeCount: doc.data().likeCount,
          commentCount: doc.data().commentCount,
          screamId: doc.id
        });
      });
      return res.json(userData);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// Get authenticated user details (Redux data)
exports.getAuthenticatedUser = (req, res) => {
  let userData = {};
  db.doc(`/users/${req.user.email}`)
    .get()
    .then(doc => {
      if (doc.exists) {
        userData.credentials = doc.data();
        return db
          .collection('projects')
          .where('createdBy', '==', req.user.email)
          .get();
      }
    })
    .then(data => {
      userData.projects = [];
      data.forEach(doc => {
        userData.projects.push(doc.data());
      });
      return db
        .collection('teams')
        .where('members', 'array-contains', req.user.email)
        .get();
    })
    .then(data => {
      userData.teams = [];
      data.forEach(doc => {
        userData.teams.push(doc.data());
      });
      return db
        .collection('notifications')
        .where('recipient', '==', req.user.email)
        .orderBy('createdAt', 'desc')
        .limit(10)
        .get();
    })
    .then(data => {
      userData.notifications = [];
      data.forEach(doc => {
        userData.notifications.push(doc.data());
      });
      return res.json(userData);
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// Upload image
exports.uploadAvatar = (req, res) => {
  const BusBoy = require('busboy');
  const path = require('path');
  const os = require('os');
  const fs = require('fs');

  const busboy = new BusBoy({ headers: req.headers });

  let imageToBeUploaded = {};
  let imageFileName;

  busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
    console.log(fieldname, file, filename, encoding, mimetype);

    //Allow only JPGs and PNGs
    if (mimetype !== 'image/jpeg' && mimetype !== 'image/png') {
      return res.status(400).json({ error: 'Wrong file type submitted' });
    }

    const imageExtension = filename.split('.')[filename.split('.').length - 1];

    imageFileName = `${Math.round(Math.random() * 1000000000000).toString()}.${imageExtension}`;
    const filepath = path.join(os.tmpdir(), imageFileName);
    imageToBeUploaded = { filepath, mimetype };
    file.pipe(fs.createWriteStream(filepath));
  });

  busboy.on('finish', () => {
    admin
      .storage()
      .bucket()
      .upload(imageToBeUploaded.filepath, {
        resumable: false,
        metadata: {
          metadata: {
            contentType: imageToBeUploaded.mimetype
          }
        }
      })
      .then(() => {
        const avatarUrl = `https://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageFileName}?alt=media`;
        return db.doc(`/users/${req.user.email}`).update({ avatarUrl });
      })
      .then(() => {
        return res.json({ message: 'Profile image uploaded successfully' });
      })
      .catch(err => {
        console.error(err);
        return res.status(500).json({ error: 'something went wrong' });
      });
  });

  busboy.end(req.rawBody);
};

// Mark all notifications as read
exports.markNotificationsRead = (req, res) => {
  let batch = db.batch();
  req.body.forEach(notificationId => {
    const notification = db.doc(`/notifications/${notificationId}`);
    batch.update(notification, { read: true });
  });
  batch
    .commit()
    .then(() => {
      return res.json({ message: 'Notifications marked read' });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};
