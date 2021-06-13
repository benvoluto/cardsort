import React, { useState, useCallback, useRef, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, push, set } from 'firebase/database';
import './app.sass';

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
if (!getApps().length) {
  initializeApp(config);
}

/* eslint-disable no-mixed-operators */
// https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
const generateUUID = () => {
  let d = new Date().getTime(),
    d2 = (performance && performance.now && performance.now() * 1000) || 0;
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    let r = Math.random() * 16;
    if (d > 0) {
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x7) | 0x8).toString(16);
  });
};

// approach heavily informed by this example
// https://medium.com/@RethnaGanesh/developing-a-kanban-board-using-react-dnd-and-react-hooks-1cae2e11ea99
const Group = ({ status, changeCardGroup, children }) => {
  const ref = useRef(null);
  const [, drop] = useDrop({
    accept: 'card',
    drop(item) {
      changeCardGroup(item.id, status);
    },
  });
  drop(ref);
  return <div className={`group ${status === 0 ? 'ungrouped' : ''}`} ref={ref}> {children}</div>;
};

const Card = ({ id, children }) => {
  const ref = useRef(null);
  const [{ isDragging }, drag] = useDrag({
    item: { type: 'card', id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const opacity = isDragging ? 0 : 1;
  drag(ref);
  return (
    <div ref={ref} style={{ opacity }}>
      {children}
    </div>
  );
};

const NewGroupName = ({ id, handleGroupNameSubmit, handleGroupName, newGroupName, oldGroupName }) => {
  return (
    <form onSubmit={handleGroupNameSubmit} name={id} className="group-form">
      <input
        type="text"
        id="newGroupName"
        autoFocus
        className="group-name-input"
        name={id}
        autoComplete="off"
        value={newGroupName}
        onChange={handleGroupName}
        placeholder={ (oldGroupName !== '') ? oldGroupName : "New Group name"}
      />
      <button className="group-name-save-button" type="submit">Ok</button>
    </form>
  )
}

const UUID = generateUUID();

const cardsList = [];

const CATS = [
  {
    name: '',
    id: 0,
  },
  {
    name: '',
    id: 1,
  },
  {
    name: '',
    id: 2,
  },
];

const App = () => {
  const [step, setStep] = useState('one');
  const [newCard, setNewCard] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [editGroupId, setEditGroupId] = useState(null);
  const [newId, setNewId] = useState(0);
  const [cards, setCardStatus] = useState(cardsList);
  const [groups, setGroups] = useState(CATS);
  // https://mariosfakiolas.com/blog/use-useref-hook-to-store-values-you-want-to-keep-an-eye-on/
  const data = useRef(null);

  useEffect(() => {
    const prevData = data.current;
    if (cards !== prevData) {
      data.current = cards;
    }
  },[cards, data]);
  
  const stepCheck = useCallback(() => {
    if (cards.length > 12) {
      setStep('two');
      const validation = groups.every(card => {
        return card.status !== 0;
      });
      if (validation) {
        setStep('three');
      }
    };
    return step;
  }, [cards, groups, step]);

  const changeCardGroup = useCallback((id, status) => {
      let card = cards.find((card) => card.cardId === id);
      const prevCard = card;
      const cardIndex = cards.indexOf(card);
      if (status === prevCard.status) {
        return true;
      } else {
        card = { ...card, status };
        let newCards = update(cards, {
          [cardIndex]: { $set: card },
        });
        setCardStatus(newCards);
      }
    },
    [cards]
  );

  const handleNewCard = (e) => {
    setNewCard(e.target.value);
  };

  const handleGroupName = (e) => {
    setNewGroupName(e.target.value);
  };

  const handleNewCardSubmit = (e) => {
    e.preventDefault();
    let existingCard = cards.find((card) => card.title === newCard);
    if (existingCard) {
      alert('You entered that card already'); 
      setNewCard('');
      return true;
    }
    if (newCard && !existingCard) {
      const theCard = {
        cardId: newId,
        title: newCard,
        status: 0,
      };
      setCardStatus((cards) => [...cards, theCard]);
      setNewCard('');
      setNewId(newId + 1);
    }
    stepCheck();
  };

  const clickGroupNameChange = useCallback((e) => {
    setNewGroupName('');
    setEditGroupId(parseInt(e.target.getAttribute('name'))); 
  }, []);

  const handleGroupNameSubmit = useCallback(
    (e) => {
      e.preventDefault();
      const theId = e.target.getAttribute('name');
      let theGroup = groups.find((group) => group.id === parseInt(theId));
      const groupIndex = groups.indexOf(theGroup);
      const theNewName = newGroupName ? newGroupName : theGroup.name;
      const newGroup = { ...theGroup, name: theNewName };
      let newGroups = update(groups, {
        [groupIndex]: { $set: newGroup },
      });
      setGroups(newGroups);
      setNewGroupName('');
      setEditGroupId(null);
      stepCheck();
    },
    [groups, newGroupName, stepCheck]
  );

  const handleNewGroup = (e) => {
    const groupIndex = groups.length;
    const theGroup = {
      name: '',
      id: groupIndex,
    };
    setGroups((groups) => [...groups, theGroup]);
  };

  const handleCardRemove = useCallback((e) => {
    const theCardId = e.target.getAttribute('name');
    let theCard = cards.find((card) => card.cardId === parseInt(theCardId));
    const cardIndex = cards.indexOf(theCard);
    // https://github.com/kolodny/immutability-helper
    let newCards = update(cards, { $splice: [[cardIndex, 1]] });
    setCardStatus(newCards);
  }, [cards]);


  const handleData = () => {
    const db = getDatabase();
    const surveyListRef = ref(db, 'surveys');
    const newSurveyRef = push(surveyListRef);
    set(newSurveyRef, {cards, groups, UUID})
    .then(() => {
      console.log("mo bettah");
    })
    .catch((error) => {
      console.log("mo problems");
    });
  }

  return (
    <main className={`app ${step}`}>
      <div className="hidden">User id {UUID}</div>
      <div className="instructions-one">Please enter 12 or more shows and movies that you have seen in the past year, as many as you can remember.</div>
      <div className="instructions-two">Now, organize them into whatever groups make sense to you, and give each group a name.</div>
      <div className="instructions-three">Okay, you can make some final tweaks or send your survey whenever you're done. Thanks!</div>
      <DndProvider backend={HTML5Backend}>
        <section className="groups">
          {groups.map((group) => {
            const groupLabel = (group.name === '') ? 'Add a Name for this Group' : group.name;
            return (
              <Group
                key={group.id}
                status={group.id}
                changeCardGroup={changeCardGroup}
              >
                { (group.id > 0) ? (
                  <div className="group-add">
                    {
                      (editGroupId === group.id) ? (
                        <NewGroupName 
                          id={group.id}
                          oldGroupName={group.name}
                          handleGroupNameSubmit={handleGroupNameSubmit}
                          handleGroupName={handleGroupName}
                          newGroupName={newGroupName}
                        /> ): (
                          <button className="group-name-edit" name={group.id} onClick={clickGroupNameChange}>{groupLabel}</button>
                        )
                    }
                  </div>
                  ) : null 
                }
                <div className="group-items">
                  {cards
                    .filter((cardItem) => cardItem.status === group.id)
                    .map((cardItem) => (
                      <Card key={cardItem.cardId} id={cardItem.cardId}>
                        <div className="card">
                          <button name={cardItem.cardId} className="close-button" onClick={handleCardRemove}>
                          &times;
                          </button>
                          {cardItem.title}
                        </div>
                      </Card>
                    ))
                  }
                  {
                    (group.id === 0) ? (
                      <form onSubmit={handleNewCardSubmit} className="add-form">
                        <input
                          type="text"
                          id="new-show"
                          className="showInput"
                          name={group.id}
                          autoComplete="off"
                          value={newCard}
                          onChange={handleNewCard}
                          placeholder="show title"
                        />
                        <button type="submit" className="button add-show">
                          Add show
                        </button>
                      </form>
                    ) : null
                  }
                </div>
              </Group>
            )
          })}
          <button onClick={handleNewGroup} className="add-group-button">
            <span className="add-group-plus">+</span>
            <span className="add-group-label">Add Group</span>
          </button>
        </section>
      </DndProvider>
      <div className="send">
        <button className="button" onClick={() => handleData()}>Send Survey</button>
      </div>
    </main>
  );
};

export default App;
