import React, { useState, useCallback, useRef, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getDatabase, ref, push, set } from 'firebase/database';
import { DndProvider } from 'react-dnd';
import { MultiBackend } from 'dnd-multi-backend';
import { HTML5toTouch } from 'rdndmb-html5-to-touch';
import generateUUID from './uuid';
import GroupNameEdit from './group-name-edit';
import Group from './group';
import Cards from './cards';
import NewCard from './new-card';
import TouchPreview from './touch-preview';
import Instructions from './instructions';
import { isTouch } from './config'
import config from './config';
import { CATS, INSTRUCTIONS } from './constants';
import './app.sass';


if (!getApps().length) {
  initializeApp(config);
};

// approach heavily informed by this example
// https://medium.com/@RethnaGanesh/developing-a-kanban-board-using-react-dnd-and-react-hooks-1cae2e11ea99
// and 
// https://mariosfakiolas.com/blog/use-useref-hook-to-store-values-you-want-to-keep-an-eye-on/

// if user is coming with an id from another survey use that
const url_string = window.location.href;
const url = new URL(url_string);
const pid = url.searchParams.get('pid');
const uuid = pid || generateUUID();

const touch = isTouch() ? 'touch-capable' : '';

const App = () => {
  const [step, setStep] = useState(1);
  const [newCard, setNewCard] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [editGroupId, setEditGroupId] = useState(null);
  const [newId, setNewId] = useState(0);
  const [cards, setCardStatus] = useState([]);
  const [groups, setGroups] = useState(CATS);
  const [error, setError] = useState(null);
  const cardData = useRef(null);
  const groupData = useRef(null);

  useEffect(() => {
    const prevCardData = cardData.current;
    const prevGroupData = groupData.current;
    if (cards !== prevCardData) {
      cardData.current = cards;
    }
    if (groups !== prevGroupData) {
      groupData.current = groups;
    }
  },[cards, cardData, groups, groupData]);
  
  const stepCheck = useCallback(() => {
    const cardsGrouped = cards.filter((card) => card.status === 0).length <= 1;
    const groupsNamed = groups.filter((group) => group.name === '').length <= 1;
    const enoughCards = (cards.length > 10);

    if (enoughCards) {
      setStep(2);
    }

    if (enoughCards && cardsGrouped) {
      setStep(3);
    }

    if (enoughCards && cardsGrouped && groupsNamed) {
      setStep(4);
    }
    return step;
  }, [cards, groups, step]);

  const changeCardGroup = useCallback((id, status) => {
      let cardToUpdate = cards.find((card) => card.cardId === id);
      const prevCard = cardToUpdate;
      const cardIndex = cards.indexOf(cardToUpdate);
      if (status === prevCard.status) {
        return true;
      } else {
        let newCards = [...cards];
        cardToUpdate = { ...cardToUpdate, status };
        newCards[cardIndex] = cardToUpdate;
        setCardStatus(newCards);
        stepCheck();
      }
    },
    [cards, stepCheck]
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
      let theGroupToUpdate = groups.find((group) => group.id === parseInt(theId));
      let existingGroup = groups.find((group) => group.name === newGroupName);
      if (existingGroup) {
        alert('Please enter a name (or use a different one).'); 
        setNewGroupName('');
        return true;
      }
      const groupIndex = groups.indexOf(theGroupToUpdate);
      const theNewName = newGroupName ? newGroupName : theGroupToUpdate.name;
      const newGroup = { ...theGroupToUpdate, name: theNewName };
      let newGroups = [...groups];
      newGroups[groupIndex] = newGroup;
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
    let theCardToRemove = cards.find((card) => card.cardId === parseInt(theCardId));
    const cardIndex = cards.indexOf(theCardToRemove);
    let newCards = [...cards];
    newCards.splice(cardIndex, 1);
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
    <main className={`app step-${step} ${touch}`}>
      <Instructions step={step} instructions={INSTRUCTIONS} />
      <div className="uuid">User id { uuid }</div>
      <DndProvider backend={MultiBackend} options={HTML5toTouch}>
        <section className="groups">
          {groups.map((group) => {
            return (
              <Group
                key={group.id}
                status={group.id}
                changeCardGroup={changeCardGroup}
              >
                <GroupNameEdit 
                  group={group}
                  editGroupId={editGroupId}
                  handleGroupNameSubmit={handleGroupNameSubmit}
                  handleGroupName={handleGroupName}
                  clickGroupNameChange={clickGroupNameChange}
                  newGroupName={newGroupName}
                /> 
                <div className="group-items">
                  <Cards 
                    cards={cards}
                    handleCardRemove={handleCardRemove} 
                    group={group} 
                  />
                  { group.id === 0 ? <TouchPreview cards={cards} /> : null }
                  <NewCard
                    group={group}
                    newCard={newCard}
                    handleNewCard={handleNewCard}
                    handleNewCardSubmit={handleNewCardSubmit} 
                  />
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
        <button className="send-button" onClick={() => handleData()}>Done</button>
        { error ? <div className="error">{error}</div> : null}
      </div>
      <div className="sent">
        <span className="sent-message">Thank you very much for helping out!</span>
      </div>
    </main>
  );
};

export default App;
