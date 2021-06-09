import React, { useState, useReducer } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, push, set } from "firebase/database";
import './app.sass';

const config = {
  apiKey: "AIzaSyBNNtCxgk-__SYzCLVwgioXmbYHUmYGX9k",
  authDomain: "surveys-24eb8.firebaseapp.com",
  databaseURL: "https://surveys-24eb8-default-rtdb.firebaseio.com",
  projectId: "surveys-24eb8",
  storageBucket: "surveys-24eb8.appspot.com",
  messagingSenderId: "42159276532",
  appId: "1:42159276532:web:98303b378b3b91269839a1",
  measurementId: "G-TWH298STVC"
}
if (!getApps().length) {
  initializeApp(config); 
}

// create an input and "add" button
// Enter show titles
// when 15-20 shows entered, reveal next step button
// reveal a category picker next to each show entered
// choose or create a category for each show
// create: enter text, set category, update pickers
// when all shows have categories, reveal submit button

/* eslint-disable no-mixed-operators */
// https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
const generateUUID = () => {
  let
    d = new Date().getTime(),
    d2 = (performance && performance.now && (performance.now() * 1000)) || 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x7 | 0x8)).toString(16);
  });
};
const UUID = generateUUID();
const CATS = [
  {
    name: 'please pick a category',
    id: 0,
  },
];


const App = (props) => {
  const [show, setShow] = useState('');
  const [shows, setShows] = useState([]);
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState(CATS);
  const [step, setStep] = useState('one');

  const handleAddShow = (e) => {
    setShow(e.target.value);
  };

  const handleCategoryInputChange = (e) => {
    setCategory(e.target.value);
  };

  const handleCategoryChange = (e) => {
    const theShowIndex = e.target.getAttribute('name');
    const theCategoryValue = e.target.value;
    const updatedShows = shows;
    updatedShows[theShowIndex].category = theCategoryValue;
    console.log(updatedShows);
    setShows(updatedShows);
    forceUpdate();
  };

  // https://reactjs.org/docs/hooks-faq.html#is-there-something-like-forceupdate
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (show) {
      const theShow = {
        title: show,
        category: 0,
      };
      setShows((shows) => [...shows, theShow]);
      setShow('');
    }
    stepCheck();
  };

  const handleCategorySubmit = (e) => {
    e.preventDefault();
    const categoryIndex = categories.length + 1;
    if (category) {
      const theCategory = {
        name: category,
        category: categoryIndex,
      };
      setCategories((categories) => [...categories, theCategory]);
      setCategory('');
    }
  };

  const handleShowRemove = (e) => {
    const index = e.target.getAttribute('name');
    const updatedShows = shows;
    updatedShows.splice(index, 1);
    setShows(updatedShows);
    forceUpdate();
  };

  const handleData = () => {
    const obj = {shows, categories, UUID};
    const db = getDatabase();
    const surveyListRef = ref(db, 'surveys');
    const newSurveyRef = push(surveyListRef);
    set(newSurveyRef, {obj})
    .then(() => {
      console.log("mo bettah");
    })
    .catch((error) => {
      console.log("mo problems");
    });;
  }

  const stepCheck = () => {
    if (shows.length > 15) {
      setStep('two');
      if (categories.length > 2) {
        setStep('three');
      }
    };
    return step;
  };

  return (
    <div className={`app ${step}`}>

      <div className="instructions">Please enter 15 or more of your favorite shows, and put them in 2 or more groups.</div>
      <div>User id {UUID}</div>

      <div>
        <h3>Shows</h3>
        {shows.map((show, index) => {
          const number = index + 1;
          return (
            <div key={index}>
              <span>{number}. </span>
              <span>{show.title}</span>
              <button name={index} onClick={handleShowRemove}>
                Remove
              </button>
              <select name={index} onChange={handleCategoryChange}>
                {categories.map((category, key) => (
                  <option key={key} value={key}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
          );
        })}
        <form onSubmit={handleAddSubmit} className="add-form">
          <input
            type="text"
            id="new-show"
            className="showInput"
            name="text"
            autoComplete="off"
            value={show}
            onChange={handleAddShow}
          />
          <button type="submit" className="button">
            Add show
          </button>
        </form>
      </div>

      <div className="groups">
        {categories.map((category, key) => { return (key > 0 ? <div key={key}>{category.name}</div> : null)})}
        <form onSubmit={handleCategorySubmit} className="group-form">
          <input
            type="text"
            id="new-category"
            className="categoryInput"
            name="text"
            autoComplete="off"
            value={category}
            onChange={handleCategoryInputChange}
          />
          <button type="submit" className="button">
            Add Group
          </button>
        </form>
      </div>

      <div className="send">
        <button className="button hidden" onClick={() => handleData()}>Send Survey</button>
      </div>
    </div>
  );
};

export default App;
