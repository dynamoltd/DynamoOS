let db = {
  users: [
    {
      userId: 'UOQrm6c3Alhit5TQfmTIwTpAMpM2',
      firstName: 'Fname',
      lastName: 'Lname',
      email: 'user@email.com',
      userType: 'dynamoMaster', //dynamoMaster, dynamoAdmin, dynamoUser, customerAdmin, customerUser, resourceAdmin, resourceUser
      organization: 'Dynamo',
      avatarUrl: 'https://firebasestorage.googleapis.com/v0/b/dynamo-os-1.appspot.com/o/no-avatar.jpg?alt=media',
      createdAt: '2019-09-09T07:44:55.520Z'
    }
  ],

  projects: [
    {
      projectId: 'bvNYiam1EfoVQuv0iK18',
      code: 'XX001',
      name: 'Project 001',
      growthProg: 'MENA/APAC',
      logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
      iframeSrc: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
      createdBy: 'user@email.com',
      status: 'Archived',
      tags: ['reports', 'new', 'test'],
      createdAt: '2019-09-05T11:42:40.812Z',
      commentCount: 5
    }
  ],

  comments: [
    {
      commentId: 'sdHL879hjklefgshHfdsg',
      projectId: 'bvNYiam1EfoVQuv0iK18j',
      addedBy: 'user@email.com',
      addedByAvatar: 'https://firebasestorage.googleapis.com/v0/b/dynamo-os-1.appspot.com/o/no-avatar.png?alt=media',
      body: 'nice one mate!',
      createdAt: '2019-09-12T11:42:40.812Z'
    }
  ],

  notifications: [
    {
      recipient: 'user@email.com',
      sender: 'user@email.com',
      read: 'true | false',
      projectId: 'kdjsfgdksuufhgkdsufky',
      type: 'reaction | comment',
      createdAt: '2019-03-15T10:59:52.798Z'
    }
  ]
};

const userDetails = {
  // Constructed Redux data
  credentials: {
    id: 'UOQrm6c3Alhit5TQfmTIwTpAMpM2',
    userType: 'webmaster', //
    firstName: 'Fname',
    lastName: 'Lname',
    email: 'user@email.com',
    avatarUrl: 'https://firebasestorage.googleapis.com/v0/b/dynamo-os-1.appspot.com/o/no-avatar.jpg?alt=media',
    createdAt: '2019-09-09T07:44:55.520Z'
  },

  projects: [
    {
      projectId: 'hh7O5oWfWucVzGbHH2pa'
    },
    {
      projectId: '3IOnFoQexRcofs5OhBXO'
    }
  ],

  teams: [
    {
      teamId: 'hh7O5oWfWucVzGbHH2pa'
    },
    {
      teamId: '3IOnFoQexRcofs5OhBXO'
    }
  ]
};
