// Design inspired by this shoot: https://dribbble.com/shots/3367213-Poll-app-concept -->
import React, { useState, useEffect } from 'react';
import firebase from 'firebase';
import './styles.css';

const config = {
  apiKey: 'AIzaSyBlmZRqeEbGsuuCQYU3rlm4FLFUdOePXfU',
  authDomain: 'voting-app-21f48.firebaseapp.com',
  databaseURL: 'https://voting-app-21f48.firebaseio.com',
  projectId: 'voting-app-21f48',
  storageBucket: 'voting-app-21f48.appspot.com',
  messagingSenderId: '713362202808',
  appId: '1:713362202808:web:a3266f52671027c146944d',
  measurementId: 'G-46C15B4F57'
};

if (!firebase.apps.length) {
  firebase.initializeApp(config);
}

const db = firebase.database();

export default function App() {
  const [voteDetails, setVote] = useState({
    voted: false,
    data: [],
    votes: [],
    active: false,
    voteFinalValue: '',
    database: null
  });

  const activeHandler = (id) => {
    if (!voteDetails.voted) {
      setVote((state) => ({ ...state, active: id }));
    }
  };

  const calculateVotes = () => {
    const { data, votes } = voteDetails;
    const votesObj = {};

    votes.forEach((vote) => {
      votesObj[vote] = votesObj[vote] ? ++votesObj[vote] : 1;
    });

    data.forEach((data) => {
      const id = data.id;
      const votePercent = ((votesObj[id] || 0) / votes.length) * 100;
      const voteFinalValue = votePercent.toFixed(2);

      setVote((state) => ({ ...state, voteFinalValue: voteFinalValue }));
    });
  };

  const submitHandler = () => {
    const { voted, active, data, database } = voteDetails;

    if (!voted) {
      if (!active) {
        alert('Please select an option.');
        return;
      }

      database.child(active).update({
        votes: data.find((item) => item.id === active).votes + 1
      });

      calculateVotes();

      setVote((state) => ({
        ...state,
        votes: [...state.votes, active],
        voted: true
      }));
    }
  };

  useEffect(() => {
    const database = db.ref('/items');

    database.once('value', (snapshot) => {
      const itemsObj = snapshot.val();
      if (itemsObj) {
        let data = [];
        let votes = [];
        Object.keys(itemsObj).forEach((key) => {
          data.push({ ...itemsObj[key], id: key });
          for (let i = 0; i < itemsObj[key].votes; i++) {
            votes.push(key);
          }
        });

        setVote((state) => ({
          ...state,
          data: data,
          votes: votes,
          database: database
        }));
      }
    });
  }, []);

  return (
    <div className="container">
      <h2>Vote for your fovorite project</h2>
      <div className="items-container">
        {voteDetails.data.length === 0 ? (
          <p>Fetching data from the DB...</p>
        ) : (
          voteDetails.data.map((data, idx) => (
            <div
              onClick={activeHandler.bind(this, data.id)}
              key={idx}
              className={
                voteDetails.active === data.id ? 'item active' : 'item'
              }
            >
              <span>{data.value}</span>
              <small>
                {voteDetails.active === data.id
                  ? voteDetails.voteFinalValue
                  : ''}
              </small>
              <div
                style={{ width: voteDetails.voteFinalValue }}
                className="percent-bar"
              ></div>
            </div>
          ))
        )}
      </div>
      <button className="btn" onClick={submitHandler}>
        {voteDetails.voted === true
          ? 'Thank you for your response'
          : 'Submit Vote!'}
      </button>
    </div>
  );
}
