    /*global chrome*/
import React, { useEffect, useState } from 'react';
import ChatMobile from './ChatMobile';

import { SHA256, enc } from 'crypto-js';
import crypto from "crypto";

import axios from 'axios';
import prox from '../prox.json'

import JSSoup from 'jssoup';

function Dashboard() {

  let [channels, setChannels] = useState([])
  let [selectedChannel, setSelectedChannel] = useState("")
  let [user, setUser] = useState([])
  let [userlist, setUserList] = useState([])
  let [id, setId] = useState("")

  let channelArr = [{
    channelName: '',
    data: [],
    loaded: false
  }]

  function setLoaded(paramHash) {
    if (paramHash == 'documentNotBigEnough') {
      return 'documentNotBigEnough'
    } else {
      return true
    }
  }

  function idInit() {
    function makeid(length) {
      let result = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;
      let counter = 0;
      while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
      }
      return result;
    }

    const tempId = (SHA256(makeid(128)).toString(enc.Hex)).toString()
    if (localStorage.getItem("id")) {
      if (localStorage.getItem("id").length > 0) {
        setId(id=localStorage.getItem('id'))
      } else {
        setId(id=tempId)
        localStorage.setItem('id', id);
      }
    } else {
      setId(id=tempId)
      localStorage.setItem('id', id);
    }
  }

  // gets server info like server name
  useEffect(async() => {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    let result;
    try {
      [{result}] = await chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: () => document.documentElement.innerHTML,
      });
    } catch (e) {
      document.body.textContent = 'Cannot access page';
      return;
    }
    
    chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
      let url = tabs[0].url;

      idInit()

      let title = tabs[0].title
      if (tabs[0].title.length > 28) {
        title = title.substring(0, 28) + "-...";
      }
      
      var soup = new JSSoup(result);
      var hash = SHA256(soup.find('body').text).toString(enc.Hex);

      let jsonPayload = {hash: hash, url: url, id: id}

      axios.post(prox.proxy + '/data', jsonPayload).then((result0) => {
        if (result0.data.response === 'ok') {
          
          if (result0.data.data.length > 0) {
            channelArr = [{
              // 26
              channelName: title,
              data: result0.data.data[0].messages,
              // loaded: true
              loaded: setLoaded(result0.data.hash)
            }]
          } 
          else {
            channelArr = [{
              channelName: title,
              data: [],
              // loaded: true
              loaded: setLoaded(result0.data.hash)
            }]
          }

          setChannels(channels = channelArr)
          setSelectedChannel(channels[0].channelName)
        }
      })
    })

  }, [])

  return (
    <div className="appMobile">
      
      <ChatMobile 
        selectedChannel={selectedChannel} setSelectedChannel={setSelectedChannel}
        channels={channels} setChannels={setChannels} 
        user={user} 
        id={id}
      />
    </div>

  )
}

export default Dashboard;
