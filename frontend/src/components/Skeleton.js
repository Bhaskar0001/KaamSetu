import React from 'react';
import '../index.css';

const Skeleton = ({ height = '20px', width = '100%', style = {} }) => {
    return (
        <div
            className="skeleton"
            style={{
                height,
                width,
                backgroundColor: '#e2e8f0',
                borderRadius: '4px',
                marginBottom: '10px',
                animation: 'pulse 1.5s infinite',
                ...style
            }}
        />
    );
};

export default Skeleton;
