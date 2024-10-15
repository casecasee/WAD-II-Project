// testing
function updateBudget() {
    const budget = parseFloat(document.getElementById('budget').value);
    const spending = parseFloat(document.getElementById('spending').value);
    
    // Calculate percentage of budget used
    const percentage = (spending / budget) * 100;
    
    // Cap the percentage at 100 to prevent overflow
    const cappedPercentage = Math.min(percentage, 100);
  
    // Update the circular progress bar
    const progressRing = document.querySelector('.progress-ring-circle');
    progressRing.style.background = `conic-gradient(#4caf50 ${cappedPercentage}%, #ccc ${cappedPercentage}% 100%)`;
    
    // Update the text inside the ring
    document.getElementById('progress-value').innerText = `${Math.round(cappedPercentage)}%`;
  }