import React from 'react'
import './ChatHeader.css'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function ChatHeader({ channelName, setShowMenu }) {
  return (
    <div className="chatHeader0">
        <div className="chatHeader__left">
            <h3>
                {channelName ? (
                  <span className="chatHeader__hash">#</span>
                ):(<></>)}

                {setShowMenu ? (
                  <span className="chatHeader__back" onClick={()=>{setShowMenu(true)}}><ArrowBackIcon /></span>
                ):(<></>)}
                
                {channelName}
            </h3>
        </div>
    </div>
  )
}

export default ChatHeader