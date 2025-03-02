/**
 * This script generates test questions for the Tech Treasure Hunt
 * You can run it with Node.js to quickly create sets of questions
 * for different round types.
 */

// Math Quiz Questions Generator
function generateMathQuizQuestions(count = 10, difficulty = 1) {
  const operations = ['addition', 'subtraction', 'multiplication', 'division'];
  const questions = [];
  
  // Set ranges based on difficulty
  let minValue = 1;
  let maxValue = 10;
  
  if (difficulty === 2) {
    minValue = 10;
    maxValue = 50;
  } else if (difficulty === 3) {
    minValue = 20;
    maxValue = 100;
  }
  
  for (let i = 1; i <= count; i++) {
    // Select random operation
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    // Generate random numbers
    let num1 = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
    let num2 = Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
    let correctAnswer;
    let question;
    
    // Ensure division doesn't result in decimal for easier difficulty
    if (operation === 'division' && difficulty < 3) {
      correctAnswer = num1;
      num1 = num1 * num2;
    }
    
    // Compute answer and format question
    switch (operation) {
      case 'addition':
        correctAnswer = num1 + num2;
        question = `${num1} + ${num2}`;
        break;
      case 'subtraction':
        // Ensure positive result for easier difficulty
        if (difficulty < 2 && num2 > num1) {
          [num1, num2] = [num2, num1];
        }
        correctAnswer = num1 - num2;
        question = `${num1} - ${num2}`;
        break;
      case 'multiplication':
        correctAnswer = num1 * num2;
        question = `${num1} × ${num2}`;
        break;
      case 'division':
        // Division already handled above
        question = `${num1} ÷ ${num2}`;
        break;
    }
    
    questions.push({
      question_number: i,
      question,
      correct_answer: correctAnswer
    });
  }
  
  return questions;
}

// Generate test questions for Round 1 (Easy)
const round1Questions = generateMathQuizQuestions(10, 1);
console.log('===== ROUND 1 QUESTIONS (EASY) =====');
console.log(JSON.stringify(round1Questions, null, 2));

// Generate test questions for Round 2 (Hard)
const round2Questions = generateMathQuizQuestions(10, 3);
console.log('\n===== ROUND 2 QUESTIONS (HARD) =====');
console.log(JSON.stringify(round2Questions, null, 2));

// Generate image codes for Round 3
const imageCodes = [
  { image_url: "https://example.com/image1.jpg", code: "TH2023A" },
  { image_url: "https://example.com/image2.jpg", code: "SPECTRUM" },
  { image_url: "https://example.com/image3.jpg", code: "PCCOE" }
];

console.log('\n===== ROUND 3 IMAGE CODES =====');
console.log(JSON.stringify(imageCodes, null, 2));

// Instructions
console.log('\n===== INSTRUCTIONS =====');
console.log('1. Run the SQL script to create test rounds');
console.log('2. Replace USER_ID_HERE with an actual user ID');
console.log('3. To test questions manually, insert these question sets into the database');
console.log('4. The game should now show Round 1 available to play');
