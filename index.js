const userButton = document.getElementById("username-button")
const usernameContainer = document.getElementById("username-container")
const messagesContainer = document.getElementById("message-form-container")
const inputHidden = document.getElementById("message-input")
const buttonHidden = document.getElementById("send-button")
const usernameInput = document.getElementById("username-input")
const userForm = document.getElementsByClassName("user-form")[0]
const chat = document.getElementById("chat-message")
const toggleButton = document.getElementById('toggle-btn');

let nomeUsuario = "";

userButton.addEventListener("click", (event) => {
  event.preventDefault()
  validaInputUser(usernameInput)
  nomeUsuario = usernameInput.value
})

function validaInputUser(username) {
  if (username.value) {
    usernameContainer.style.display = "none";
    messagesContainer.style.display = "flex";
    buttonHidden.removeAttribute("disabled")
    inputHidden.removeAttribute("disabled")
  } else {
    alert("Insira um nome válido.")
    return false;
  }
}

toggleButton.addEventListener('click', (e) => {
  const messageElement = document.createElement("p");
  e.preventDefault();
  if (socket.connected) {
    toggleButton.innerText = 'Connect';
    socket.disconnect();
    toggleButton.style.backgroundColor = '#48C78E';
    messageElement.textContent = '*Você foi desconectado do servidor*';
    chat.appendChild(messageElement);
  } else {
    toggleButton.innerText = 'Disconnect';
    messageElement.textContent = '*Conectado com sucesso*';
    chat.appendChild(messageElement);
    socket.connect();
    toggleButton.style.backgroundColor = '#FF6685';
  }
});

// Socket.io 
const socket = io({
  auth: {
    serverOffset: 0
  }
});

userForm.addEventListener("submit", (event) => {
  event.preventDefault()
  if (inputHidden.value) {
    socket.emit('chat message', { 
      msg: inputHidden.value, 
      username: nomeUsuario 
    });
    inputHidden.value = '';
  }
});

socket.on('chat message', (data, serverOffset) => {
  const messageElement = document.createElement("p");
  messageElement.textContent = `${data.username}: ${data.msg}`;
  messageElement.classList.add("message-time");
  chat.appendChild(messageElement);
  window.scrollTo(0, document.body.scrollHeight);
  socket.auth.serverOffset = serverOffset;
});