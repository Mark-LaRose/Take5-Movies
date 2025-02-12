import React, { useState } from 'react';
import { Container } from 'react-bootstrap';
import { FaStar } from 'react-icons/fa'; 
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'; // Importing Drag and Drop
import '../styles/sidebar.css';

// Assigns different colors for stars
function getStarColor(index) {
  const colors = ['deepskyblue', 'teal', 'lime', 'purple', 'indigo', 'royalblue', 'navy', 'grey', 'gold', 'darkorange', 'red', 'magenta'];
  return colors[index % colors.length];
}

// Initialize default lists
const defaultLists = Array.from({ length: 12 }, (_, index) => ({
  id: `list-${index + 1}`, // Unique string ID for DND
  name: `Favorites List ${index + 1}`,
  color: getStarColor(index), 
}));

function Sidebar({ isLoggedIn }) {
  const [favorites, setFavorites] = useState(defaultLists);

  // Handle drag end event
  const handleDragEnd = (result) => {
    if (!result.destination) return; // Ignore if dropped outside list

    const newFavorites = [...favorites];
    const [movedItem] = newFavorites.splice(result.source.index, 1);
    newFavorites.splice(result.destination.index, 0, movedItem);

    setFavorites(newFavorites);
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
                      >
                        <FavoriteListItem list={list} />
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
        <p className="login-message">
          Login <br />
          to <br />
          access <br />
          favorites.
        </p>
      )}
    </Container>
  );
}

// Component for individual favorite list items
function FavoriteListItem({ list }) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(list.name);

  return (
    <div className="favorites-item">
      <FaStar className="star-icon" style={{ color: list.color }} />

      {isEditing ? (
        <input
          type="text"
          className="favorites-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={() => setIsEditing(false)}
          autoFocus
          maxLength={18}
        />
      ) : (
        <span className="favorites-name" onClick={() => setIsEditing(true)}>
          {inputValue}
        </span>
      )}
    </div>
  );
}

export default Sidebar;