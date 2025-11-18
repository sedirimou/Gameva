import React, { useState, useEffect } from 'react';

const CircularProgressScore = ({ score, label = "", size = 80, background = false, productId }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [randomVotes, setRandomVotes] = useState(7);

  // Generate random votes based on product ID for consistency
  useEffect(() => {
    if (productId) {
      // Use product ID as seed for consistent random votes per product
      const seed = parseInt(productId.toString().slice(-3)) || 1;
      const votes = Math.floor((seed % 50) + 10); // Random between 10-59 votes
      setRandomVotes(votes);
    } else {
      // Fallback random number if no product ID
      setRandomVotes(Math.floor(Math.random() * 50) + 10);
    }
  }, [productId]);

  // Animate score on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(score || 0);
    }, 300); // Start animation after 300ms

    return () => clearTimeout(timer);
  }, [score]);

  return (
    <div className="flex items-center border border-green-300 bg-green-50 rounded-lg px-4 py-2 h-10 min-w-[180px]">
      {/* Votes and score section */}
      <div className="flex items-center justify-between w-full space-x-3">
        <span className="text-xs text-green-600 font-medium">{randomVotes} Votes</span>
        <div className="bg-green-800 text-white rounded-md px-3 py-1 font-bold text-sm">
          {Math.round(animatedScore)}%
        </div>
      </div>
    </div>
  );
};

export default CircularProgressScore;