const functions = require('firebase-functions');
const app = require('express')();
const FBAuth = require('./utils/fbAuth');
const { db } = require('./utils/admin');

const { createProject, getProjects, getProject, deleteProject, addComment, deleteComment } = require('./handlers/projects');
const { signup, login, getAnyUser, getAuthenticatedUser, uploadAvatar, markNotificationsRead } = require('./handlers/users');

// ===> PROJECT ROUTES
app.post('/project', FBAuth, createProject);
app.get('/projects', getProjects);
app.get('/project/:projectId', FBAuth, getProject);
app.delete('/project/:projectId', FBAuth, deleteProject);
app.post('/project/:projectId/addcomment', FBAuth, addComment);
app.get('/project/:projectId/deletecomment/:commentId', FBAuth, deleteComment);

// ===> USER ROUTES
app.post('/signup', signup);
app.post('/login', login);
app.post('/user/:email', FBAuth, getAnyUser);
app.get('/user', FBAuth, getAuthenticatedUser);
app.get('/user/avatar', FBAuth, uploadAvatar);
app.post('/notifications', FBAuth, markNotificationsRead);

// ===> EXPORT FUNCTIONS
exports.api = functions.region('asia-east2').https.onRequest(app);

// Notify project user on new comment
// ==> TODO: Explore adding sender avatar to notification
exports.createNotificationOnComment = functions
  .region('asia-east2')
  .firestore.document('/comments/{commentId}')
  .onCreate(snapshot => {
    return db
      .doc(`/projects/${snapshot.data().projectId}`)
      .get()
      .then(doc => {
        if (doc.exists && doc.data().createdBy !== snapshot.data().addedBy) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            sender: snapshot.data().addedBy,
            recipient: doc.data().createdBy,
            projectId: doc.id,
            type: 'comment',
            read: false,
            createdAt: new Date().toISOString()
          });
        }
      })
      .catch(err => {
        console.error(err);
        return;
      });
  });

// Project user does not need notifying when comment is already deleted
exports.deleteNotificationOnDeleteComment = functions
  .region('asia-east2')
  .firestore.document('comments/{commentId}')
  .onDelete(snapshot => {
    console.log(snapshot.data());
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch(err => {
        console.error(err);
        return;
      });
  });

// Update user avatar for all db references on change
exports.onUserAvatarChange = functions
  .region('asia-east2')
  .firestore.document('/users/{userId}')
  .onUpdate(change => {
    console.log(change.before.data());
    console.log(change.after.data());
    if (change.before.data().avatarUrl !== change.after.data().avatarUrl) {
      console.log('User avatar has changed');
      const batch = db.batch();
      return db
        .collection('comments')
        .where('addedBy', '==', change.before.data().email)
        .get()
        .then(data => {
          data.forEach(doc => {
            const comment = db.doc(`/comments/${doc.id}`);
            batch.update(comment, { addedByAvatar: change.after.data().avatarUrl });
          });

          return batch.commit();
        });
    } else return true;
  });

//Sanitize db collections on project deletion
exports.onProjectDelete = functions
  .region('asia-east2')
  .firestore.document('/projects/{projectId}')
  .onDelete((snapshot, context) => {
    const projectId = context.params.projectId;
    const batch = db.batch();
    return db
      .collection('comments')
      .where('projectId', '==', projectId)
      .get()
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/comments/${doc.id}`));
        });
        return db
          .collection('notifications')
          .where('projectId', '==', projectId)
          .get();
      })
      .then(data => {
        data.forEach(doc => {
          batch.delete(db.doc(`/notifications/${doc.id}`));
        });
        return batch.commit();
      })
      .catch(err => console.error(err));
  });
