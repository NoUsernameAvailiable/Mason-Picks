import React from 'react';
import { getRateMyProfessorsTarget } from '../utils/coursePresentation';

export default function InstructorBadge({ instructor, onProfessorClick, className = '' }) {
    const rmp = getRateMyProfessorsTarget(instructor);

    return (
        <div className={className}>
            <button className="professor-link" onClick={() => onProfessorClick(instructor)}>
                {instructor}
            </button>
            {rmp && (
                <a
                    href={rmp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`c-link c-link--external ${rmp.isVerified ? 'c-link--verified' : ''} rmp-link`}
                    title={rmp.isVerified ? `View verified profile for ${rmp.name} on RateMyProfessors (${rmp.department})` : `Search ${rmp.name} on RateMyProfessors (GMU)`}
                    aria-label={rmp.isVerified ? `Read RateMyProfessors reviews for ${rmp.name}` : `Search ${rmp.name} on RateMyProfessors`}
                >
                    <span className="c-link-text">{rmp.actionText}</span>
                </a>
            )}
        </div>
    );
}
