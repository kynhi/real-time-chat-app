const mongoose = require('mongoose')
const uri = "mongodb+srv://admin:123@cluster0.d1guj.mongodb.net/real-time-chat-app?retryWrites=true&w=majority";
const connect = mongoose.connect(uri,{ useUnifiedTopology: true },(err)=>{
  console.log('connected')
})
module.export = connect
