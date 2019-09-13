const { db } = require('../utils/admin');
const { validateProjectData } = require('../utils/validators');

// Create new project
exports.createProject = (req, res) => {
  const newProject = {
    code: req.body.code,
    name: req.body.name,
    growthProg: req.body.growthProg,
    logo: req.body.logo,
    iframeSrc: req.body.iframeSrc,
    status: req.body.status,
    tags: req.body.tags,
    createdBy: req.user.email,
    organization: req.body.organization,
    createdAt: new Date().toISOString(),
    commentCount: 0
  };

  const { valid, errors } = validateProjectData(newProject);
  if (!valid) return res.status(400).json(errors);

  db.collection('projects')
    .add(newProject)
    .then(doc => {
      const resProject = newProject;
      resProject.projectId = doc.id;
      res.json({ message: `Project ${doc.id} created successfully`, ...resProject });
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong' });
    });
};

//Fetch all projects
exports.getProjects = (req, res) => {
  db.collection('projects')
    .orderBy('createdAt', 'desc')
    .get()
    .then(data => {
      let projects = [];
      data.forEach(doc => {
        projects.push({
          projectId: doc.id,
          ...doc.data()
        });
      });
      return res.json(projects);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// Fetch single project
exports.getProject = (req, res) => {
  let projectData = {};
  db.doc(`/projects/${req.params.projectId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Project not found' });
      }

      projectData = doc.data();
      projectData.projectId = doc.id;
      return db
        .collection('comments')
        .orderBy('createdAt', 'desc')
        .where('projectId', '==', req.params.projectId)
        .get();
    })
    .then(data => {
      projectData.comments = [];
      data.forEach(doc => {
        projectData.comments.push(doc.data());
      });
      return res.json(projectData);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

// Delete project
exports.deleteProject = (req, res) => {
  const document = db.doc(`/projects/${req.params.projectId}`);
  document
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Project not found' });
      }
      if (doc.data().createdBy !== req.user.email) {
        return res.status(403).json({ error: 'Unauthorized' });
      } else {
        return document.delete();
      }
    })
    .then(() => {
      res.json({ message: 'Project deleted successfully' });
    })
    .catch(err => {
      console.error(err);
      return res.status(500).json({ error: err.code });
    });
};

// Add comment to project
exports.addComment = (req, res) => {
  if (req.body.body.trim() === '') return res.status(400).json({ comment: 'Must not be empty' });

  const newComment = {
    projectId: req.params.projectId,
    addedBy: req.user.email,
    addedByAvatar: req.user.avatarUrl,
    body: req.body.body,
    createdAt: new Date().toISOString()
  };

  db.doc(`/projects/${req.params.projectId}`)
    .get()
    .then(doc => {
      if (!doc.exists) {
        return res.status(404).json({ error: 'Cannot comment. Project not found' });
      }
      return doc.ref.update({ commentCount: `${parseInt(doc.data().commentCount) + 1}` });
    })
    .then(() => {
      return db
        .collection('comments')
        .add(newComment)
        .then(docRef => {
          const commentData = { commentId: docRef.id, ...newComment };
          return db
            .doc(`/comments/${docRef.id}`)
            .set(commentData)
            .then(() => {
              res.json({ message: 'Comment added successfully!', ...commentData });
            })
            .catch(err => {
              console.log(err);
              res.status(500).json({ error: 'Something went wrong' });
            });
        })
        .catch(err => {
          console.log(err);
          res.status(500).json({ error: 'Something went wrong' });
        });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: 'Something went wrong' });
    });
};

// Delete comment from project
exports.deleteComment = (req, res) => {
  const commentDocument = db
    .collection('comments')
    .where('addedBy', '==', req.user.email)
    .where('projectId', '==', req.params.projectId)
    .where('commentId', '==', req.params.commentId)
    .limit(1);

  const projectDocument = db.doc(`/projects/${req.params.projectId}`);

  let projectData;

  projectDocument
    .get()
    .then(doc => {
      if (doc.exists) {
        projectData = doc.data();
        projectData.projectId = doc.id;
        return commentDocument.get();
      } else {
        return res.status(404).json({ error: 'Project not found' });
      }
    })
    .then(data => {
      if (data.empty) {
        return res.status(400).json({ error: 'Comment does not exist' });
      } else {
        return db
          .doc(`/comments/${data.docs[0].id}`)
          .delete()
          .then(() => {
            projectData.commentCount--;
            return projectDocument.update({ commentCount: projectData.commentCount });
          })
          .then(() => {
            res.json({ message: 'Comment deleted successfully' });
          });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};
