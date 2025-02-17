import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';
import axios from 'axios';
import '../styles/sidebar.css';

// ✅ Generates consistent colors for favorite lists
const getStarColor = (index) => {
  const colors = [
    'deepskyblue', 'teal', 'lime', 'purple', 'indigo', 'royalblue',
    'navy', 'grey', 'gold', 'darkorange', 'red', 'magenta'
  ];
  return colors[index % colors.length];
};

function Sidebar({ isLoggedIn, onSelectFavoritesList }) {
  const [favorites, setFavorites] = useState([]);
  const [selectedListIndex, setSelectedListIndex] = useState(null);

  useEffect(() => {
    if (isLoggedIn) {
      fetchFavorites();
    }
  }, [isLoggedIn]);

  // ✅ Fetch favorite lists from MongoDB
  const fetchFavorites = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await axios.get("http://localhost:5000/api/movies/favorites", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setFavorites(response.data.favorites);
      }
    } catch (error) {
      console.error("❌ Error fetching favorites:", error);
    }
  };

  // ✅ Handle renaming favorite lists
  const renameFavoriteList = async (index, newName) => {
    const updatedFavorites = [...favorites];
    updatedFavorites[index].name = newName;
    setFavorites(updatedFavorites);

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      await axios.post(
        "http://localhost:5000/api/movies/updateFavoriteListName",
        { index, newName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log(`✅ Renamed favorites list ${index + 1} to "${newName}"`);
    } catch (error) {
      console.error("❌ Error renaming favorite list:", error);
    }
  };

  // ✅ Handle selecting a favorite list
  const handleSelectList = (index) => {
    if (selectedListIndex === index) {
      setSelectedListIndex(null);
      onSelectFavoritesList(null);
    } else {
      setSelectedListIndex(index);
      onSelectFavoritesList(index);
    }
  };

  return (
    <Container className="sidebar">
      <h5 className="favorites-title">Favorites</h5>
      <div className="favorites-divider"></div>

      {isLoggedIn ? (
        <div>
          {favorites.map((list, index) => (
            <div
              key={index}
              className="favorites-button"
              onClick={() => handleSelectList(index)}
            >
              <FavoriteListItem 
                list={list} 
                index={index} 
                selectedListIndex={selectedListIndex} 
                renameFavoriteList={renameFavoriteList} 
              />
            </div>
          ))}
        </div>
      ) : (
        <p className="login-message">Login to access favorites.</p>
      )}
    </Container>
  );
}

// ✅ Favorite List Item (Handles Editing & Display)
function FavoriteListItem({ list, index, selectedListIndex, renameFavoriteList }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(list.name);

  return (
    <div className="favorites-item">
      <FaStar
        className="star-icon"
        style={{
          color: getStarColor(index), // ✅ Correctly applies color based on list index
          opacity: selectedListIndex === index ? 1 : 0.4, // ✅ Dimmed unless selected
          cursor: "pointer",
        }}
      />
      {isEditing ? (
        <input
          type="text"
          className="favorites-name-input"
          value={newName}
          autoFocus
          maxLength={19}
          onChange={(e) => setNewName(e.target.value)}
          onBlur={() => {
            renameFavoriteList(index, newName);
            setIsEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              renameFavoriteList(index, newName);
              setIsEditing(false);
            }
          }}
        />
      ) : (
        <span className="favorites-name" onDoubleClick={() => setIsEditing(true)}>
          {list.name}
        </span>
      )}
    </div>
  );
}

export default Sidebar;