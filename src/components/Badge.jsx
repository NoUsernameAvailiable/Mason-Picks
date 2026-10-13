import React from 'react';

export default function Badge({ size = 'small', variant, children, className = '', title }) {
    const variantClass = variant ? `bpk-badge--${variant} c-badge--${variant}` : '';
    return (
        <span
            className={`bpk-badge bpk-badge--size-${size} c-badge ${variantClass} ${className}`.trim()}
            title={title}
        >
            <span className="bpk-badge__text c-badge-label">{children}</span>
        </span>
    );
}

