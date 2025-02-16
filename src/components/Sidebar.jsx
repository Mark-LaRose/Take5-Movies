import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import '../styles/sidebar.css';

const getStarColor = (index) => {
  const colors = ['deepskyblue', 'teal', 'lime', 'purple', 'indigo', 'royalblue', 'navy', 'grey', 'gold', 'darkorange', 'red', 'magenta'];
  return colors[index % colors.length];
};

// Default lists
const defaultLists = Array.from({ length: 12 }, (_, index) => ({
  id: `list-${index + 1}`,
  name: `Favorites List ${index + 1}`,
  color: getStarColor(index),
}));

function Sidebar({ isLoggedIn, onSelectFavoritesList }) {
  const [favorites, setFavorites] = useState(defaultLists);
  const [selectedListIndex, setSelectedListIndex] = useState(null); // ✅ Track selected list

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newFavorites = [...favorites];
    const [movedItem] = newFavorites.splice(result.source.index, 1);
    newFavorites.splice(result.destination.index, 0, movedItem);
    setFavorites(newFavorites);
  };

  // ✅ Rename Favorite List
  const renameFavoriteList = (index, newName) => {
    setFavorites((prevFavorites) =>
      prevFavorites.map((list, i) => (i === index ? { ...list, name: newName } : list))
    );
  };

  // ✅ Handle Selection & Highlighting
  const handleSelectList = (index) => {
    if (selectedListIndex === index) {
        // ✅ If clicking the same list again, deselect it & show all movies
        setSelectedListIndex(null);
        onSelectFavoritesList(null); // ✅ Pass null to show main movie search
    } else {
        // ✅ Otherwise, select the clicked list
        setSelectedListIndex(index);
        onSelectFavoritesList(index);
    }
  };

  return (
    <Container className="sidebar">
      <h5 className="favorites-title">Favorites</h5>
      <div className="favorites-divider"></div>

      {isLoggedIn ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="favoritesList">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {favorites.map((list, index) => (
                  <Draggable key={list.id} draggableId={list.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => handleSelectList(index)} // ✅ Update selected list
                      >
                        <FavoriteListItem 
                          list={list} 
                          index={index} 
                          selectedListIndex={selectedListIndex} 
                          renameFavoriteList={renameFavoriteList} 
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <p className="login-message">Login to access favorites.</p>
      )}
    </Container>
  );
}

// ✅ Updated Favorite List Item (Inline Editing with No White Box)
function FavoriteListItem({ list, index, selectedListIndex, renameFavoriteList }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(list.name);

  return (
    <div className="favorites-item">
      <FaStar
        className="star-icon"
        style={{
          color: list.color,
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