// ====> /handlers/users.js

//Get auth user details - with db joins
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
    })
    .then(() => {
      db.collection('teams')
        .where('members', 'array-contains', req.user.email)
        .get()
        .then(data => {
          userData.teams = [];
          data.forEach(doc => {
            userData.teams.push(doc.data());
          });
          return res.json(userData);
        })
        .catch(err => {
          console.error(err);
          res.status(500).json({ error: err.code });
        });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

//Get auth user details - with collection filters - 4.33s
exports.getAuthenticatedUser = (req, res) => {
  db.collection('users')
    .where('email', '==', req.user.email)
    .get()
    .then(data => {
      data.forEach(doc => {
        return res.json(doc.data());
      });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

//update field array with value
db.doc(`/projects/${projectId}`).update({
  collaborators: admin.firestore.FieldValue.arrayUnion(`${req.user.email}`)
});
