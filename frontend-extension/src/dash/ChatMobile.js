    /*global chrome*/
import React from 'react'
import ChatHeader from './ChatHeader'
import Message from "./Message";
import './ChatMobile.css'
import { useRef } from 'react';

import CircularProgress from '@mui/material/CircularProgress';

import Button from '@mui/material/Button';
import UploadIcon from '@mui/icons-material/Upload';
import Button0 from '@mui/joy/Button';

import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

import { useState, useEffect } from "react";

import prox from '../prox.json'
import axios from 'axios';

import { SHA256, enc } from 'crypto-js';

import JSSoup from 'jssoup';

function Chat({
        selectedChannel, setSelectedChannel,
        channels, setChannels,
        user,
        id
    }) {
    let icon = selectedChannel.split(".")[selectedChannel.split(".").length - 1]

    let channelArr
    let jsonPayload

    const [input, setInput] = useState("")
    let [messages, setMessages] = useState([])
    let [loaded, setLoaded] = useState([false])
    let [uploading, setUploading] = useState(false)
    let [hashData, setHashData] = useState("")
    
    const messageRef = useRef()
    useEffect(() => {
        if (messageRef.current) {
            messageRef.current.scrollIntoView({
                block: 'end',
                inline: 'nearest'
            })
        }
    }, [messages])
    
    // // updates the messages depeding on the channel selected
    useEffect(() => {
        // const timeoutID = window.setTimeout(() => {
            // loops through all the channel names
            for (let index = 0; index < channels.length; index++) {
                // checks if channel name is equal to the selected channel
                if (channels[index].channelName === selectedChannel) {
                    // if the channel name and selected channel is same, then it updates the setMessages() state
                    setMessages(channels[index].data)
                    setLoaded([channels[index].loaded])
                    setHashData(channels[index].hash)
                }
            }
        // }, 100);
    
        // return () => window.clearTimeout(timeoutID );
    }, [channels])


    // gets executed when a new message is sent
    async function handleAddMessage() {
        for (let index = 0; index < channels.length; index++) {
            if (channels[index].channelName === selectedChannel) {
                
                if (selectedChannel && loaded[0] && input) {
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
                        let title = tabs[0].title;
                        
                        var soup = new JSSoup(result);
                        var hash = SHA256(soup.find('body').text).toString(enc.Hex);

                        // jsonPayload = {hash: hash, url: url, data: result, title: title}
                        jsonPayload = {hash: hash, url: url, title: title, id: id}


                        let dataTemp = []
                        for (let index = 0; index < messages.length; index++) {
                            dataTemp.push(messages[index])
                        }
                        dataTemp.push([input])
                        setMessages(messages = dataTemp)

                        console.log(result)

                        setInput('')
                        setUploading(uploading = true)
                        axios.post(prox.proxy + '/check', jsonPayload).then((result0) => {

                            if (result0.data.response === 'ok') {
                                setUploading(uploading = false)

                                jsonPayload = { hash: hash, message: input, id: id }
                                axios.post(prox.proxy + '/newMessage', jsonPayload).then((result1) => {
                                    if (result1.data.response === 'ok') {
                                        
                                        channelArr = [{
                                            channelName: 'channelName',
                                            data: result1.data.data[0].messages,
                                            loaded: true
                                        }]
                                        setChannels(channels = channelArr)

                                        jsonPayload = { hash: hash, id: id }
                                        axios.post(prox.proxy + '/response', jsonPayload).then((result2) => {
                                            if (result2.data.response === 'ok') {
                                                channelArr = [{
                                                    channelName: 'channelName',
                                                    data: result2.data.messages,
                                                    loaded: true
                                                }]
                                                setMessages(messages = result2.data.data.messages)
                                            
                                            

                                                
                                            } else {
                                                let dataTemp = []
                                                for (let index = 0; index < messages.length; index++) {
                                                    if (messages[index].length==2) {
                                                        dataTemp.push(messages[index])
                                                    }
                                                }
                                                dataTemp.push([input])
                                                setMessages(messages = dataTemp)
                                            }
                                        })
                                    } else {
                                        let dataTemp = []
                                        for (let index = 0; index < messages.length; index++) {
                                            if (messages[index].length==2) {
                                                dataTemp.push(messages[index])
                                            }
                                        }
                                        dataTemp.push([input])
                                        setMessages(messages = dataTemp)
                                    }
                                })

                            } else if (result0.data.response === 'hashNotFound') {
                                jsonPayload = {hash: hash, url: url, data: result, title: title, id: id}
                                // jsonPayload = {hash: hash, url: url, data: result}

                                axios.post(prox.proxy + '/check', jsonPayload).then((result3) => {
                                    if (result3.data.response === 'ok') {
                                        setUploading(uploading = false)
                                        
                                        jsonPayload = { hash: hash, message: input, id: id }
                                        axios.post(prox.proxy + '/newMessage', jsonPayload).then((result1) => {
                                            if (result1.data.response === 'ok') {
                                                channelArr = [{
                                                    channelName: 'channelName',
                                                    data: result1.data.data[0].messages,
                                                    loaded: true
                                                }]
                                                setChannels(channels = channelArr)

                                                jsonPayload = { hash: hash, id: id }
                                                axios.post(prox.proxy + '/response', jsonPayload).then((result2) => {
                                                    if (result2.data.response === 'ok') {
                                                        channelArr = [{
                                                            channelName: 'channelName',
                                                            data: result2.data.messages,
                                                            loaded: true
                                                        }]
                                                        setMessages(messages = result2.data.data.messages)
                                                    
                                                    
                                                    
                                                    
                                                    } else {
                                                        let dataTemp = []
                                                        for (let index = 0; index < messages.length; index++) {
                                                            if (messages[index].length==2) {
                                                                dataTemp.push(messages[index])
                                                            }
                                                        }
                                                        dataTemp.push([input])
                                                        setMessages(messages = dataTemp)
                                                    }
                                                })
                                            } else {
                                                let dataTemp = []
                                                for (let index = 0; index < messages.length; index++) {
                                                    if (messages[index].length==2) {
                                                        dataTemp.push(messages[index])
                                                    }
                                                }
                                                dataTemp.push([input])
                                                setMessages(messages = dataTemp)
                                            }
                                        })

                                    } else {
                                        let dataTemp = []
                                        for (let index = 0; index < messages.length; index++) {
                                            if (messages[index].length==2) {
                                                dataTemp.push(messages[index])
                                            }
                                        }
                                        dataTemp.push([input])
                                        setMessages(messages = dataTemp)
                                    }
                                })
                            }
                        })
                    });
                }
            }
        }
    }


    return (
        (loaded[0])?(

            <div className="chatMobile">
                <ChatHeader channelName={selectedChannel}/>

                    <div className="chatMobile__messages">
                        <div ref={messageRef}>
                            {messages.map((msg) => (
                                (msg.length==2)?(
                                    <Message hashData={hashData} msg={msg[0]} response={msg[1]}/>
                                ):(
                                    (uploading)?(
                                        <Message hashData={hashData} msg={msg[0]} uploading={true}/>
                                    ):(
                                        <Message hashData={hashData} msg={msg[0]}/>
                                    )
                                )
                            ))}
                        </div>
                    </div>
                
                <div className="chatMobile__input">
                    <form onSubmit={(e) => {e.preventDefault()}}>
                        <input className="chatMobile__mainTextFeild" disabled={!selectedChannel || !loaded[0]} value={input} onChange={(e) => setInput(e.target.value)} placeholder={(selectedChannel)?('# Ask Question'):('')} />
                        <button className="chatMobile__inputButton" type="submit" onClick={handleAddMessage}>
                            Send Message
                        </button>
                    </form>

                    <div className="chatMobile__inputIcons">
                        <ArrowUpwardIcon fontSize="medium" disabled={!selectedChannel || !loaded[0]} onClick={handleAddMessage}/>
                    </div>
                </div>
            </div>
        ):(
            <div className="chatMobile">

                <div className="chatMobile__messages">
                    <CircularProgress/>
                </div>
                

                <div className="chatMobile__input">
                    <form onSubmit={(e) => {e.preventDefault()}}>
                        <input className="chatMobile__mainTextFeild" disabled={true}/>
                    </form>

                    <div className="chatMobile__inputIcons">
                        <ArrowUpwardIcon fontSize="medium" disabled={!selectedChannel || !loaded[0]} onClick={handleAddMessage}/>
                    </div>
                </div>
            </div>

        )
    )
}

export default Chat