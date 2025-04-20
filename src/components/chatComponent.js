import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { useAuth } from "../context/AuthContext";
import "./chatComponent.css"; // 🟩 Import CSS

const socket = io("http://localhost:5000");

function ChatComponent() {
  const { token, user, logout } = useAuth();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch("http://localhost:5000/users");
        const data = await response.json();

        const id = user?._id || "user1"; // No need for 'await', just access the property
        const filteredUsers = data.filter((user) => user._id !== id);

        setUsers(filteredUsers);
        // setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();

    socket.on("receiveMessage", (messageData) => {
      setMessages((prevMessages) => [...prevMessages, messageData]);
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  const sendMessage = () => {
    if (message && selectedUser) {
      const messageData = {
        sender: user?._id || "user1",
        receiver: selectedUser,
        text: message,
      };
      socket.emit("sendMessage", messageData);
      setMessage("");
    } else {
      alert("Please select a user and enter a message!");
    }
  };

  const fetchChats = async () => {
    console.log(user?._id || "user1");
    console.log(selectedUser);
    try {
      const response = await fetch(
        `http://localhost:5000/get-chats?sender=${
          user?._id || "user1"
        }&receiver=${selectedUser}`
      );
      const data = await response.json();
      console.log(data.length);
      setMessages(data);
      console.log("Chat messages:", data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      fetchChats();
    }
  }, [selectedUser]);

  return (
    <div className="chat-container">
      <div className="sidebar">
        <h3 className="sidebar-title">Hello, {user ? user.username : ""}</h3>
        <h4>Users</h4>
        {users.map((u) => (
          <div
            key={u._id}
            className={`user-item ${selectedUser === u._id ? "active" : ""}`}
            onClick={() => setSelectedUser(u._id)}
          >
            {u.username}
          </div>
        ))}
      </div>

      <div className="chat-window">
        <div className="chat-header">
          <div className="chat-header-inside">
            <h4>
              Chat with:{" "}
              {users.find((u) => u._id === selectedUser)?.username ||
                "Select a user"}
            </h4>
            <p onClick={logout}>logout</p>
          </div>
        </div>

        <div className="chat-messages">
          {Array.isArray(messages) && messages.length > 0 ? (
            messages.map((msg, index) => (
              <div
                className={`message-bubble-head ${
                  user._id === msg.sender
                    ? "message-bubble-head-start"
                    : "message-bubble-head-end"
                }`}
              >
                <div
                  key={index}
                  className={`message-bubble ${
                    msg.sender === user?.username ? "sent" : "received"
                  }`}
                >
                  <span>{msg.text}</span>
                </div>
              </div>
            ))
          ) : (
            <p>No messages available</p>
          )}
        </div>

        <div className="chat-input">
          <input
            type="text"
            className="chatInputField"
            value={message}
            placeholder="Type a message..."
            onChange={(e) => setMessage(e.target.value)}
            autofocus
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default ChatComponent;
