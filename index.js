// import express from 'express'
const express = require('express');

const app = express();

app.use(express.static('public')); // 'public' is the name of your static directory

app.get('/', (req, res) => {
  res.sendFile('./index.html');
})

app.listen(3000);