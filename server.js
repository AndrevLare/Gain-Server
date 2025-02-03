const express = require("express");
const WebSocket = require("ws");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3030; // Puerto para el servidor HTTP
const wsPort = 8080; // Puerto para el servidor WebSocket
const wsPort1 = 8081; // Puerto para el servidor WebSocket

// Middleware para permitir CORS
app.use(cors());

// Middleware para parsear el cuerpo de las solicitudes POST
app.use(bodyParser.json());

// ENDPOINTS
let hasWallet = false;
// Endpoint para verificar si el usuario tiene una billetera
app.post("/api/hasWallet", (req, res) => {
  // const data = req.body;
  // console.log("Received POST data:", data);
  res.status(200).send({ hasWallet: hasWallet });
});

// Iniciar el servidor HTTP
app.listen(port, () => {
  console.log(`HTTP server is running on http://localhost:${port}`);
});

// Iniciar el servidor WebSocket
const server = new WebSocket.Server({ port: wsPort });
let $status = 0;

server.on("connection", (socket) => {
  console.log("Client connected");

  const changeStatus = (newStatus) => {
    $status = newStatus;
    if ($status === 600) {
      socket.send(JSON.stringify({ status: $status, solAmount: 15 }));
    } else socket.send(JSON.stringify({ status: $status }));
  };

  socket.on("message", (message) => {
    console.log("Received:", message);
    socket.send(JSON.stringify({ status: $status }));
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });

  server.changeStatus = changeStatus;
});

console.log(`WebSocket server is running on ws://localhost:${wsPort}`);

// Iniciar el servidor WebSocket 2
const server1 = new WebSocket.Server({ port: wsPort1 });
let $validationStatus = 200;

server1.on("connection", (socket) => {
  console.log("Client connected 2");

  const changeStatus = (newStatus) => {
    console.log("cambiar status 2 websocket 2");
    $validationStatus = newStatus;
    if ($validationStatus === 600) {
      console.log(15);
      socket.send(JSON.stringify({ status: $validationStatus, solAmount: 15 }));
    } else socket.send(JSON.stringify({ status: $validationStatus }));
  };

  socket.on("message", (message) => {
    console.log("Received:", message);
    if ($validationStatus === 600) {
      console.log(15);
      socket.send(JSON.stringify({ status: $validationStatus, solAmount: 15 }));
    } else socket.send(JSON.stringify({ status: $validationStatus }));
  });

  socket.on("close", () => {
    console.log("Client disconnected");
  });

  server1.changeStatus = changeStatus;
});

console.log(`WebSocket 2 server is running on ws://localhost:${wsPort}`);

// Endpoint para recibir el nombre del hunter
let name = "";
app.post("/api/intro/hunterName", (req, res) => {
  const data = req.body;
  console.log(data);
  console.log("Received POST data:", data.hunterName);
  name = data.hunterName;
  server.changeStatus(100);
  if (
    !data.hunterName ||
    typeof data.hunterName !== "string" ||
    data.hunterName.length === 0 ||
    data.hunterName.length > 20
  ) {
    // Responder con un código de estado 422 si la validación falla
    return res.status(400).json({ error: "Invalid hunter name" });
  } else res.status(200).json({ error: "todo bien pa" });
});

// Endpoint para disparar la creación de la billetera (solo cambiar status)
app.post("/api/intro/createWalletTrigger", (req, res) => {
  console.log("Crear Billtera");
  server.changeStatus(200);
  res.status(200).json({ data: "todo bien pa" });
});

// Endpoint para solicitar el qr y el code
app.post("/api/intro/requestQrAndCode", (req, res) => {
  console.log("Devolver QR y Code");
  res.status(200).json({
    qr: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJYAAACWCAIAAACzY+a1AAAACXBIWXMAAA7EAAAOxAGVKw4bAAAEZklEQVR4nO2d227jMAxEN4v+/y93HzYIAlhlRuTE6cDnPMbRpR2QkimKuX1/f/+BZP5+egIwBQnjQcJ4kDAeJIwHCeNBwniQMB4kjAcJ40HCeJAwni/xe7fbbT7Yc0j90eHjw+chlh+KPR+xTP7k4fTjB6wwHiSMR3WkDxrni0vHUrvK2hcd51APsZzz0ZMv+6mfLp1/8clLGk4YK4wHCeNBwni218JndlcsV9sasW39MvOgfqrzvr8XK4wHCeMZOdITmGz9dz1qY1a/AawwHiSM5/OOtA6diG0nnk3fc9YO/FNghfEgYTxIGM9oLfTGUPQDDXEJdC2Qu7Oqm9jBCuNBwni2HakrMFHHUI6eapJ3o7ctZvLym0fOCeJghfEgYTy33xBf+I/uDJdNCvQg+G6I/DeAFcaDhPEgYTzmhPxGxqa4yOkZm+JUxWCQvihOlu3JuFhhPEgYjzkhf+nuGqHqE9L1l4hx88Yrh/h/a/SMFcaDhPGojlTcajZ2hpP92/L7uzeMzglGvy/ugxXGg4TxIGE86kmFN/Tw8unugqHfTqqH8FY6OOfOFFYYDxLGM3KkltBt46n3ZlPD3U38bSNnpwYrjAcJ4/EkIYqJzPbk68nez1IarOH8LdlAz2CF8SBhPEgYz3Yeqe6sdxPjl6NMjovrOdtfOWqIzsCPIGE8o4T89x1jWtzsZAix7TOTaNSkEANWGA8SxmM+L5xU2H2f23nfJdC6w0ZUiCTEK4KE8SBhPOY80rptY+s/6bkRFRLHFc8iGnCz6YogYTyjI99GpPj4oaUTnUm4eZIrtPsSpYMVxoOE8XiiM2ITV3bM7lNxno22L/sRe+aK6KVBwniQMB7PbzZNYhlLLNcE7BcB6qe7+auuc3KsMB4kjGeUhGhJrDshAWeCPXFyCS8VlwYJ4zHvSBuB3UkcRHRZjaycSWRnOS51Z+BHkDAeJIzHk5BfMwl/iDSOai1NJq8N3GyCO0gYz6i8uqWyTE3D3dXDiafE9ddciTxFJyQhXggkjGdUXv3oOhoZLnXb5dPdO++uqJDYifiHcF4Id5AwHiSMx/yL2o3qMI3Xld3IzqRmzRJxXP2NaHnUI4IVxoOE8ZgLeDVcRyPefcKcLbeTqDsDEkgYz/bNpprJ4Z8908Ti0H6aofL9BuxIrwgSxoOE8YxyZ0YDD8oHTI6a37eoT0ot7Pb2DFYYDxLGM8qd2WV5oVKse+XKu/Ge9E5K6lB3Bu4gYTyj3BmRkzeBlttJE3/7vn/REqwwHiSMBwnj+fwPwYq9LXuusRRm88ZcGjN5CVYYDxLGM0pCnFCXWjh+rW6rl0uYuD5LZV/xegJh7guBhPF8zJEemexIXa7y2GGdODlx4OxI4Q4SxoOE8ZhvNrmwxF/EFUu/9yTOU3zVoe4M3EHCeMwJ+TWuELklbV48Lp4U/5qEyInOXAgkjOdj2dzgAiuMBwnjQcJ4kDAeJIwHCeNBwniQMB4kjAcJ40HCeJAwHiSM5x+M9McqFtt2XgAAAABJRU5ErkJggg==",
    code: "SOLXYZSJADKJADLADKLAKDLKL",
  });
});

// Endpoint para verificar el estado de la validación
app.post("/test", (req, res) => {
  console.log("cambiar status 2");
  if ($validationStatus === 200) {
    server1.changeStatus(300);
  } else if ($validationStatus === 300) {
    server1.changeStatus(400);
  } else if ($validationStatus === 400) {
    server1.changeStatus(500);
  } else if ($validationStatus === 500) {
    server1.changeStatus(600);
  }
  res.status(200).json({ msg: "todo bien pa" });
});

// Endpoint para cambiar el estado de la hasWallet
app.post("/api/intro/startGainApp", (req, res) => {
  console.log("Iniciar Gain App");
  hasWallet = true;
  res.status(200).json({ data: "todo bien pa" });
});

app.post("/api/Dashboard/userData", (req, res) => {
  console.log("Devolver Datos de Usuario");
  res.status(200).json({
    userTier: "Top Hunter",
    username: name,
    position: 7,
    invitor: "fkjsdkjfs",
    code: "MGCoachK24 ",
    huntersJoined: 127,
  });
});

class Wallet {
  static idCounter = 0;

  constructor(name, info, isInvitatorWallet) {
    this.isInvitatorWallet = isInvitatorWallet;
    this.name = name;
    this.info = info;
    this.id = `${Wallet.idCounter++}`;
  }
}

let wallet1 = new Wallet(
  "Stefan Godly",

  123,
  true
);
let wallet2 = new Wallet("David Gonzalo", 5123);
let wallet3 = new Wallet("Jorge Gonzalez", "5sdfsdfsdf54sdf4s4jhg5f");
let wallets = [wallet1, wallet2, wallet3];

app.post("/api/wallet-overview", (req, res) => {
  console.log("enviar lista de billeteras");
  res.status(200).json({
    wallets: wallets,
  });
});

app.post("/api/editWallet", (req, res) => {
  const data = req.body;
  console.log("editar billetera con id: " + data.id);
  const wallet = wallets.find((wallet) => wallet.id === data.id);

  res.status(200).json({ wallet });
});

app.post("/api/delete-wallet", (req, res) => {
  console.log("eliminar billetera");
  const data = req.body;

  wallets = wallets.filter((wallet) => wallet.id !== data.id);

  res.status(200).json({ message: "Billetera eliminada correctamente" });
});

app.post("/api/edit-wallet/save", (req, res) => {
  console.log("guardar cambios");
  const data = req.body;

  wallet = wallets.find((wallet) => wallet.id === data.id);
  wallet.name = data.name;
  res.status(200).json("Succesfully saved");
});

app.post("/api/add-wallet", (req, res) => {
  const data = req.body;

  wallets.push(new Wallet(data.name, 4564));
  res.status(200).json("Succesfully created");
});

class Alert {
  static idCounter = 0;

  constructor(name, age, hunters) {
    this.name = name;
    this.hunters = hunters;
    this.age = age;
    this.id = `${Wallet.idCounter++}`;
  }
}

let alert1 = new Alert("Shmoo", 70, 15);
let alert2 = new Alert("Silco", 20, 35);
let alert3 = new Alert("Cryptoman", 843, 576);
let alert4 = new Alert("Jorge", 25000, 13);

let alerts = [alert1, alert2, alert3, alert4];

app.post("/api/alerts", (req, res) => {
  console.log("enviar lista de alertas");
  res.status(200).json({
    alerts: alerts,
  });
});

app.post("/api/delete-alert", (req, res) => {
  console.log("eliminar alerta");
  const data = req.body;

  alerts = alerts.filter((wallet) => wallet.id !== data.id);

  res.status(200).json({ message: "Alerta eliminada correctamente" });
});

let tapAmount = 0.01;
let symbol = "wETH";

app.post("/api/settings/get", (req, res) => {
  const data = req.body;
  res.status(200).json({ tapAmount: tapAmount, symbol: symbol });
});

app.post("/api/settings/save", (req, res) => {
  const data = req.body;

  tapAmount = data.tapAmount;
  symbol = data.symbol;

  console.log(
    "Guardar ajustes...  symbol:" + symbol + "...   Tap Amount: " + tapAmount
  );

  res.status(200).json({ tapAmount: tapAmount, symbol: symbol });
});

class Trade {
  static idCounter = 0;

  constructor(name, age, ROI) {
    this.name = name;
    this.ROI = ROI;
    this.age = age;
    this.id = `${Wallet.idCounter++}`;
  }
}

let trade1 = new Trade("Shmoo", 520, 150);
let trade2 = new Trade("Silco", 2, 350);
let trade3 = new Trade("Cryptoman", 60, 576);
let trade4 = new Trade("Jorge", 120, 130);
let trade5 = new Trade("Andres", 841, 50);

let trades = [trade1, trade2, trade3, trade4, trade5];

app.post("/api/trades", (req, res) => {
  console.log("enviar lista de trades");
  res.status(200).json({
    trades: trades,
  });
});

app.post("/api/delete-trade", (req, res) => {
  console.log("eliminar trade");
  const data = req.body;

  trades = trades.filter((trade) => trade.id !== data.id);

  res.status(200).json({ message: "trade eliminado correctamente" });
});
