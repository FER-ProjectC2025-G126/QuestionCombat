import React from 'react';

export default function Background({ children }) {
  return (
    <div className="background">
        <div id="q1" className="falling-question">?</div>
        <div id="q2" className="falling-question">?</div>
        <div id="q3" className="falling-question">?</div>
        <div id="q4" className="falling-question">?</div>
        <div id="q5" className="falling-question">?</div>
        <div id="q6" className="falling-question">?</div>
        <div id="q7" className="falling-question">?</div>
        <div id="q8" className="falling-question">?</div>
        <div id="q9" className="falling-question">?</div>
        {children}
    </div>
  );
}