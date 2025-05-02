// Function to add details for Asics Gel 1130
function addAsicsGelDetails() {
  // Details to add
  const details = [
    "Look tendance fin des années 2000",
    "Superpositions en daim et sous-couches en mesh respirant",
    "Procédé de teinture en solution (réduit l'eau de 33% et émissions carbone de 45%)",
    "Technologie GEL pour amorti moelleux et absorption des chocs",
    "Système de maintien TRUSSTIC pour améliorer la stabilité"
  ];
  
  // Get the current state and state setter from React
  // This requires React DevTools to be installed
  const formElement = document.getElementById('product-form');
  if (!formElement) {
    console.error("Product form not found!");
    return;
  }
  
  // Direct DOM manipulation approach since we can't easily access React state
  // First make sure the details array exists in the component's state
  window.__asicsDetails = details;
  
  // Method 1: Try to add each detail using the input field and button
  const addDetails = () => {
    const input = document.getElementById('detail-input');
    const addButton = input.parentElement.nextElementSibling;
    
    if (!input || !addButton) {
      console.error("Input or button not found");
      return;
    }
    
    let index = 0;
    
    const addNextDetail = () => {
      if (index >= details.length) {
        console.log("All details added successfully!");
        return;
      }
      
      // Set the input value
      input.value = details[index];
      
      // Create and dispatch events
      const inputEvent = new Event('input', { bubbles: true });
      input.dispatchEvent(inputEvent);
      
      // Click the button
      addButton.click();
      
      // Move to next detail
      index++;
      
      // Add a small delay before adding the next one
      setTimeout(addNextDetail, 200);
    };
    
    addNextDetail();
  };
  
  addDetails();
}

// Run the function
addAsicsGelDetails();

// Instructions:
// 1. Open your form in the browser
// 2. Open the browser console (F12 or Ctrl+Shift+J or Command+Option+J)
// 3. Copy and paste this entire script into the console
// 4. Press Enter to execute

// Simple debugging script for adding details to the form

// First, let's check what's happening with formData.details
const debugForm = () => {
  // Get React DevTools instance if available
  if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    console.log("React DevTools detected, this might help us inspect the component state");
  }
  
  // Check the input field and button
  const input = document.getElementById('detail-input');
  const addButton = input?.parentElement?.nextElementSibling;
  
  console.log("Input field:", input);
  console.log("Add button:", addButton);
  
  // Let's try to manually create a simple detail entry
  if (input && addButton) {
    console.log("Going to try adding a test entry");
    
    // First, log any existing details shown in the UI
    const detailsContainer = document.querySelector('.flex.flex-wrap.gap-2');
    const existingDetails = detailsContainer ? Array.from(detailsContainer.children).map(el => el.textContent.trim()) : [];
    console.log("Existing details in UI:", existingDetails);
    
    // Try adding a test entry
    input.value = "TEST DETAIL " + new Date().toISOString().substring(0, 19);
    console.log("Set input value to:", input.value);
    
    // Dispatch input event
    input.dispatchEvent(new Event('input', { bubbles: true }));
    console.log("Dispatched input event");
    
    // Instead of clicking the button directly, let's try to create a React-friendly click
    // event with a small delay
    setTimeout(() => {
      console.log("About to click Add button");
      addButton.click();
      console.log("Clicked Add button");
      
      // Check if the detail was added
      setTimeout(() => {
        const updatedDetailsContainer = document.querySelector('.flex.flex-wrap.gap-2');
        const updatedDetails = updatedDetailsContainer ? Array.from(updatedDetailsContainer.children).map(el => el.textContent.trim()) : [];
        console.log("Details after adding:", updatedDetails);
      }, 500);
    }, 100);
  }
};

// Run debugging
debugForm();

// Instructions to add the Asics Gel details manually:
const asicsDetails = [
  "Look tendance fin des années 2000",
  "Superpositions en daim et sous-couches en mesh respirant",
  "Procédé de teinture en solution (réduit l'eau de 33% et émissions carbone de 45%)",
  "Technologie GEL pour amorti moelleux et absorption des chocs",
  "Système de maintien TRUSSTIC pour améliorer la stabilité"
];

console.log("Copy these details one by one:");
asicsDetails.forEach((detail, index) => {
  console.log(`${index + 1}. ${detail}`);
});
