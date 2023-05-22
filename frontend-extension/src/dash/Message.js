import React from 'react'
import './Message.css'

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Avatar from '@mui/joy/Avatar';
import LoadingButton from '@mui/joy/Button';
import Box from '@mui/joy/Box';

function Message({ hashData, date, msg, response, uploading }) {
  return (
    (hashData==='documentNotBigEnough')?(
        <div>
            <div className="message">
                <div className="message__info">
                    <h1>
                        Website does not have enough content
                    </h1>
                </div>
            </div>
        </div>
    ):(
        <div>
            <div className="message">
                <AccountCircleIcon fontSize="large" />

                <div className="message__info">
                    {(msg)?(
                        <p>{msg}</p>
                    ):(
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <p>
                                <LoadingButton loading variant="plain">
                                    Plain
                                </LoadingButton>
                            </p>
                        </Box>
                    )}
                </div>
            </div>
            <div className="message_response">
                <img src="/robot.png" alt="image" width="35" height="35"/>
                <div className="message__info_response">
                    {(response)?(
                        <p>{response}</p>
                    ):(
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <p>
                                {(uploading)?(
                                    <>Scanning Webpage, Do not Close!<br /></>
                                ):(
                                    <>Generating Response</>
                                )}
                                <LoadingButton loading variant="plain">
                                    Plain
                                </LoadingButton>
                            </p>
                        </Box>
                    )}
                </div>
            </div>        
        </div>
    )
  )
}

export default Message