const config = {
  apiKey: 'AIzaSyBNNtCxgk-__SYzCLVwgioXmbYHUmYGX9k',
  authDomain: 'surveys-24eb8.firebaseapp.com',
  databaseURL: 'https://surveys-24eb8-default-rtdb.firebaseio.com',
  projectId: 'surveys-24eb8',
  storageBucket: 'surveys-24eb8.appspot.com',
  messagingSenderId: '42159276532',
  appId: '1:42159276532:web:98303b378b3b91269839a1',
  measurementId: 'G-TWH298STVC',
};

export const isTouch = () => {
  try {
      let prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');

      let mq = function (query) {
          return window.matchMedia(query).matches;
      };

      if (('ontouchstart' in window) || (typeof window.DocumentTouch !== "undefined" && document instanceof window.DocumentTouch)) {
          return true;
      }

      return mq(['(', prefixes.join('touch-enabled),('), 'heartz', ')'].join(''));
  } catch (e) {
      console.error('(Touch detect failed)', e);
      return false;
  }
}

export default config;