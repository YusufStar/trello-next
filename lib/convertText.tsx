import React from 'react';

const convertToClickableLinks = (text: string) => {
    const pattern = /(\b(?:https?|ftp):\/\/[\-A-Z0-9+&@#\/%?=~_|!:,.;]*[\-A-Z0-9+&@#\/%=~_|])/gi;

    const parts = text.split(pattern);

    return (
        <p>
            {parts.map((part, index) => {
                if (pattern.test(part)) {
                    return (
                        <a key={index} href={part} target="_blank" rel="noopener noreferrer" style={{ color: 'red' }}>
                            {part}
                        </a>
                    );
                } else {
                    return <span key={index}>{part}</span>;
                }
            })}
        </p>
    );
};

export default convertToClickableLinks;
