import React, { useState, useCallback, useRef, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, push, set } from 'firebase/database';
import { DndProvider } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import update from 'immutability-helper';
import generateUUID from './uuid';
import NewGroupName from './new';
import Group from './group';
import Card from './card';
import config from './config';
import { CATS, INSTRUCTIONS } from './constants';
import './app.sass';

if (!getApps().length) {
  initializeApp(config);
};

// approach heavily informed by this example
// https://medium.com/@RethnaGanesh/developing-a-kanban-board-using-react-dnd-and-react-hooks-1cae2e11ea99
// and
// https://github.com/kolodny/immutability-helper
// and 
// https://mariosfakiolas.com/blog/use-useref-hook-to-store-values-you-want-to-keep-an-eye-on/


// if user is coming with an id from another survey use that
const url_string = window.location.href;
const url = new URL(url_string);
const pid = url.searchParams.get('pid');
const uuid = pid || generateUUID();

const App = () => {
  const [step, setStep] = useState(1);
  const [newCard, setNewCard] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [editGroupId, setEditGroupId] = useState(null);
  const [newId, setNewId] = useState(0);
  const [cards, setCardStatus] = useState([]);
  const [groups, setGroups] = useState(CATS);
  const [error, setError] = useState(null);
  const data = useRef(null);

  useEffect(() => {
    const prevData = data.current;
    if (cards !== prevData) {
      data.current = cards;
    }
  },[cards, data]);
  
  const stepCheck = useCallback(() => {
    if (cards.length > 12) {
      setStep(2);
      const validation = groups.every(card => {
        return card.status !== 0;
      });
      if (validation) {
        setStep(3);
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
    let newCards = update(cards, { $splice: [[cardIndex, 1]] });
    setCardStatus(newCards);
  }, [cards]);


  const handleData = () => {
    const db = getDatabase();
    const surveyListRef = ref(db, 'surveys');
    const newSurveyRef = push(surveyListRef);
    set(newSurveyRef, {cards, groups, uuid})
    .then(() => {
      setStep(4);
    })
    .catch((error) => {
      setError(error);
    });
  }

  return (
    <main className={`app step-${step}`}>
      <div className="hidden">User id { uuid }</div>
      <div className="instructions">{ INSTRUCTIONS[step] ? INSTRUCTIONS[step].text : null }</div>

      <DndProvider backend={HTML5Backend}>
        <section className="groups">
          {groups.map((group) => {
            const groupLabel = (group.name === '') ? 'Add a label for this group' : group.name;
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
                        <button type="submit" className="button add-card">
                          Add card
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
        <button className="send-button" onClick={() => handleData()}>Send Survey</button>
        { error ? <div className="error">{error}</div> : null}
      </div>
      <div className="sent">
        <span className="sent-message">Thank you very much for helping out!</span>
      </div>
    </main>
  );
};

export default App;
