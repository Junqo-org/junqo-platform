export const SIGN_UP_REQUEST = {
  query: `mutation signup(
      $type: UserType!
      $email: Email!
      $name: String!
      $password: String!
    ) {
      signUp(type: $type, email: $email, name: $name, password: $password) {
        token
        user {
          ...data
        }
      }
    }

    fragment data on User {
      id
      name
      email
      type
    }`,
  variables: {
    type: 'SCHOOL',
    email: 'email@email.com',
    name: 'testUser',
    password: 'password',
  },
};

export const SIGN_IN_REQUEST = {
  query: `mutation signin($email: Email!, $password: String!) {
      signIn(email: $email, password: $password) {
        token
        user {
          ...data
        }
      }
    }

    fragment data on User {
      id
      name
      email
      type
    }`,
  variables: {
    email: 'email@email.com',
    password: 'password',
  },
};

export const IS_LOGGED_IN_REQUEST = {
  query: `query {
    isLoggedIn
  }`,
};

export const CREATE_OFFER_REQUEST = {
  query: `mutation createOffer($offerInput: CreateOfferInput!) {
    createOffer(offerInput: $offerInput) {
      id
      title
      description
      status
      skills
      offerType
      workLocationType
      userId
      viewCount
      createdAt
      updatedAt
    }
  }`,
  variables: {
    offerInput: {
      userId: '',
      title: 'Test Offer',
      description: 'This is a test offer',
      status: 'ACTIVE',
      skills: ['nestjs', 'typescript'],
      offerType: 'INTERNSHIP',
      workLocationType: 'HYBRID',
    },
  },
};

export const GET_OFFERS_REQUEST = {
  query: `query {
    offers {
      id
      title
      description
      status
      skills
      offerType
      workLocationType
      userId
      viewCount
      createdAt
      updatedAt
    }
  }`,
};

export const GET_OFFER_BY_ID_REQUEST = {
  query: `query offer($offerId: ID!) {
    offer(offerId: $offerId) {
      id
      title
      description
      status
      skills
      offerType
      workLocationType
      userId
      viewCount
      createdAt
      updatedAt
    }
  }`,
  variables: {
    offerId: '', // To be filled dynamically
  },
};

export const UPDATE_OFFER_REQUEST = {
  query: `mutation updateOffer($offerId: ID!, $offerInput: UpdateOfferInput!) {
    updateOffer(offerId: $offerId, offerInput: $offerInput) {
      id
      title
      description
      status
      skills
      offerType
      workLocationType
      userId
      viewCount
      createdAt
      updatedAt
    }
  }`,
  variables: {
    offerId: '', // To be filled dynamically
    offerInput: {
      title: 'Updated Offer',
      description: 'This is an updated offer',
      status: 'INACTIVE',
    },
  },
};

export const DELETE_OFFER_REQUEST = {
  query: `mutation deleteOffer($offerId: ID!) {
    deleteOffer(offerId: $offerId)
  }`,
  variables: {
    offerId: '', // To be filled dynamically
  },
};

export const GET_STUDENT_PROFILE_REQUEST = {
  query: `query studentProfile($userId: ID!) {
    studentProfile(userId: $userId) {
      userId
      name
      avatar
      skills
      experiences {
        title
        company
        startDate
        endDate
        description
        skills
      }
    }
  }`,
  variables: {
    userId: '', // To be filled dynamically
  },
};

export const UPDATE_STUDENT_PROFILE_REQUEST = {
  query: `mutation updateStudentProfile($studentProfileInput: StudentProfileInput!) {
    updateStudentProfile(studentProfileInput: $studentProfileInput) {
      userId
      name
      avatar
      skills
      experiences {
        title
        company
        startDate
        endDate
        description
        skills
      }
    }
  }`,
  variables: {
    studentProfileInput: {
      avatar: 'https://picsum.photos/200/300',
      skills: ['JavaScript', 'TypeScript', 'NestJS', 'GraphQL'],
      experiences: [
        {
          title: 'experience title',
          company: 'Junqo',
          startDate: '2007-12-03T10:15:30Z',
          endDate: '2007-12-03T10:15:30Z',
          description: 'description 2',
          skills: ['nestjs', 'flutter'],
        },
      ],
    },
  },
};

// Apply to offer request
export const APPLY_TO_OFFER_REQUEST = {
  query: `mutation applyToOffer($offerId: ID!) {
    applyToOffer(offerId: $offerId) {
      id
      createdAt
      offer {
        id
        title
      }
      applying {
        userId
        name
      }
    }
  }`,
  variables: {
    offerId: '', // To be filled dynamically
  },
};

// Get user offer applications request
export const GET_USER_OFFER_APPLICATIONS_REQUEST = {
  query: `query userOfferApplications($userId: ID!) {
    userOfferApplications(userId: $userId) {
      id
      createdAt
      offer {
        id
        title
        description
      }
      applying {
        userId
        name
      }
    }
  }`,
  variables: {
    userId: '', // To be filled dynamically
  },
};

// Get offer applications request
export const GET_OFFER_APPLICATIONS_REQUEST = {
  query: `query offerApplications($offerId: ID!) {
    offerApplications(offerId: $offerId) {
      id
      createdAt
      offer {
        id
        title
      }
      applying {
        userId
        name
      }
    }
  }`,
  variables: {
    offerId: '', // To be filled dynamically
  },
};

export const GET_USERS_REQUEST = {
  query: `query {
    users {
      id
      name
      email
      type
    }
  }`,
};

export const GET_USER_BY_ID_REQUEST = {
  query: `query user($id: ID!) {
    user(id: $id) {
      id
      name
      email
      type
    }
  }`,
  variables: {
    id: '', // To be filled dynamically
  },
};

export const UPDATE_USER_REQUEST = {
  query: `mutation updateUser(
    $id: ID!,
    $name: String,
    $email: Email,
    $type: UserType,
    $password: String
  ) {
    updateUser(
      id: $id,
      name: $name,
      email: $email,
      type: $type,
      password: $password
    ) {
      id
      name
      email
      type
    }
  }`,
  variables: {
    id: '', // To be filled dynamically
    name: 'Updated User Name',
    email: 'updated@example.com',
  },
};

export const DELETE_USER_REQUEST = {
  query: `mutation deleteUser($id: ID!) {
    deleteUser(id: $id)
  }`,
  variables: {
    id: '', // To be filled dynamically
  },
};
