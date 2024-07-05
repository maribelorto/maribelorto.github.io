// Configuração do Firebase
let firebaseConfig = {
    apiKey: "AIzaSyDBPk9TL40RUnNYZDVNrtdob-8pav2L6o0",
    authDomain: "future-skills-9d296.firebaseapp.com",
    databaseURL: "https://future-skills-9d296-default-rtdb.firebaseio.com",
    projectId: "future-skills-9d296",
    storageBucket: "future-skills-9d296.appspot.com",
    messagingSenderId: "534479883675",
    appId: "1:534479883675:web:b0fd2ef996d09e4586253e",
    measurementId: "G-FKW9GRZQT5"
};
 
// Inicialização do Firebase com as configurações fornecidas
firebase.initializeApp(firebaseConfig);
 
// Referência ao nó 'dados_bomba' no Realtime Database, ordenando pelos últimos dados
const dbRef = firebase.database().ref('dados_bomba').orderByKey().limitToLast(1);
 
// Monitorando mudanças no último dado de temperatura
dbRef.on('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
        const message = childSnapshot.val();
        const temperatura = message.temperatura;
        const temperaturaElement = document.getElementById('real-time-temperature');
        // Atualizando o elemento HTML com a temperatura atual
        temperaturaElement.textContent = `Temperatura Atual: ${temperatura}°C`;
    });
});
 
// Monitorando mudanças no último dado de fluxo
dbRef.on('value', function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
        const message = childSnapshot.val();
        const fluxo = message.fluxo;
        const fluxoElement = document.getElementById('real-time-fluxo');
        // Atualizando o elemento HTML com o fluxo atual
        fluxoElement.innerHTML = `Fluxo Atual:<br>${fluxo} m³/h`;
    });
});
 
// Referência ao nó 'dados_bomba' para carregar mensagens históricas
let messagesRef = firebase.database().ref('dados_bomba');
 
// Carregar mensagens ao carregar a página
window.onload = function () {
    loadMessages();
};
 
// Função para carregar mensagens do Firebase
function loadMessages() {
    messagesRef.once('value', function (snapshot) {
        snapshot.forEach(function (childSnapshot) {
            let message = childSnapshot.val();
            // Exibindo cada mensagem carregada
            displayMessage(message);
        });
    });
}
 
// Função para exibir uma mensagem na lista
function displayMessage(message) {
    let mensagemLista = document.getElementById('mensagem-lista');
    let mensagemDiv = document.createElement('div');
    mensagemDiv.classList.add('mensagem-item');
    mensagemDiv.setAttribute('data-date', message.data_hora.split('T')[0]);
    mensagemDiv.setAttribute('data-time', message.data_hora.split('T')[1]);
    let mensagemHTML = `
        <p>Fluxo (m³/h): ${message.fluxo}</p>
        <p>Temperatura (°C): ${message.temperatura}</p>  
        <p>Data: ${message.data_hora}</p>
        <hr>
    `;
    mensagemDiv.innerHTML = mensagemHTML;
    // Adicionando a mensagem ao contêiner da lista
    mensagemLista.appendChild(mensagemDiv);
}
 
// Função para buscar e filtrar dados por data e hora
function searchData() {
    const searchDate = document.getElementById('search-date').value;
    const searchTime = document.getElementById('search-time').value;
 
    if (searchDate) {
        let startDate = searchDate;
        let endDate = new Date(new Date(searchDate).getTime() + 24*60*60*1000).toISOString().split('T')[0];
 
        if (searchTime) {
            startDate += 'T' + searchTime + ':00';
            endDate = new Date(new Date(startDate).getTime() + 60*60*1000).toISOString();
        } else {
            startDate += 'T00:00:00';
            endDate += 'T23:59:59';
        }
 
        messagesRef.orderByChild('data_hora').startAt(startDate).endAt(endDate).once('value', function(snapshot) {
            let mensagemLista = document.getElementById('mensagem-lista');
            mensagemLista.innerHTML = '';
            snapshot.forEach(function(childSnapshot) {
                let message = childSnapshot.val();
                // Verifica se a hora está dentro do intervalo exato
                if (searchTime) {
                    let messageTime = message.data_hora.split('T')[1].substring(0, 5);
                    if (messageTime === searchTime) {
                        displayMessage(message);
                    }
                } else {
                    displayMessage(message);
                }
            });
        });
    } else {
        loadMessages();
    }
}
 
// Referência ao database do Firebase
var database = firebase.database();
 
// Função para atualizar os avisos de status dos LEDs
function updateAlerts(data) {
    var led2On = data.led2_on;
    var led3On = data.led3_on;
    var blinkingLeds = data.blinking_leds;
 
    document.getElementById('led2-status').textContent = led2On ? 'Sim' : 'Não';
    document.getElementById('led3-status').textContent = led3On ? 'Sim' : 'Não';
    document.getElementById('blinking-status').textContent = blinkingLeds ? 'Sim' : 'Não';
}
 
// Escutando mudanças no nó 'status_leds' para atualizar os alertas
database.ref('status_leds').on('value', function(snapshot) {
    var data = snapshot.val();
    // Atualizando os alertas com os novos dados
    updateAlerts(data);
});
