// Paste firebase configuration here. You can find it in your project settings after adding your web app to your project

const firebaseConfig = {
  development: {},
  staging: {},
  production: {},
};

export default firebaseConfig[process.env.NODE_ENV];
