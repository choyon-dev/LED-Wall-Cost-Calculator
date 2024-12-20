// Constants for cost calculation
const PIXEL_PITCH_COSTS = { '1.5': 100, '2.9': 80, '4.0': 60 };
const USAGE_MULTIPLIERS = { 'indoor': 1, 'outdoor': 1.2 };
const ADDON_COSTS = { mounting: 200, videoProcessor: 500, delivery: 300 };

// DOM Elements
const widthInput = document.getElementById('width');
const heightInput = document.getElementById('height');
const pixelPitchSelect = document.getElementById('pixelPitch');
const usageTypeSelect = document.getElementById('usageType');
const rentalRadio = document.querySelector('[value="rental"]');
const purchaseRadio = document.querySelector('[value="purchase"]');
const durationInput = document.getElementById('duration');
const totalCostDisplay = document.getElementById('totalCost');
const rentalDurationGroup = document.getElementById('rental-duration-group');

// Show/Hide Rental Duration Input
rentalRadio.addEventListener('change', () => {
  rentalDurationGroup.style.display = 'block';
});
purchaseRadio.addEventListener('change', () => {
  rentalDurationGroup.style.display = 'none';
});

// Calculate Cost
const calculateCost = () => {
  const width = parseFloat(widthInput.value) || 0;
  const height = parseFloat(heightInput.value) || 0;
  const pixelPitch = pixelPitchSelect.value;
  const usageType = usageTypeSelect.value;
  const isRental = rentalRadio.checked;
  const duration = parseFloat(durationInput.value) || 0;

  const area = width * height;
  const baseCost = area * PIXEL_PITCH_COSTS[pixelPitch] * USAGE_MULTIPLIERS[usageType];
  const addonsCost =
    (document.getElementById('mounting').checked ? ADDON_COSTS.mounting : 0) +
    (document.getElementById('videoProcessor').checked ? ADDON_COSTS.videoProcessor : 0) +
    (document.getElementById('delivery').checked ? ADDON_COSTS.delivery : 0);

  let totalCost = baseCost + addonsCost;
  if (isRental) {
    totalCost += duration * 50; // Daily rental rate
  }

  totalCostDisplay.textContent = `$${totalCost.toFixed(2)}`;
};

// Attach Event Listeners
document.querySelectorAll('input, select').forEach((el) => {
  el.addEventListener('input', calculateCost);
});

// First, remove the old event listener for PDF generation
document.getElementById('generatePDF').removeEventListener('click', generateDetailedPDF);

// Add the new event listener
document.addEventListener('DOMContentLoaded', function() {
    // Get all form inputs
    const inputs = document.querySelectorAll('input, select');
    
    // Add change event listener to each input
    inputs.forEach(input => {
        input.addEventListener('change', updateTotalCost);
        input.addEventListener('input', updateTotalCost);
    });
    
    // Add event listener for rental/purchase radio buttons
    const rentOrBuyInputs = document.querySelectorAll('input[name="rentOrBuy"]');
    rentOrBuyInputs.forEach(input => {
        input.addEventListener('change', function() {
            const durationGroup = document.getElementById('rental-duration-group');
            durationGroup.style.display = this.value === 'rental' ? 'block' : 'none';
            updateTotalCost();
        });
    });
    
    // Initial cost calculation
    updateTotalCost();

    // Add PDF generation event listener
    document.getElementById('generatePDF').addEventListener('click', generateDetailedPDF);
});

// Update the generateDetailedPDF function to include console logs for debugging
function generateDetailedPDF() {
    console.log('Generating PDF...'); // Debug log
    
    try {
        const { jsPDF } = window.jspdf;
        if (!jsPDF) {
            console.error('jsPDF not loaded properly');
            return;
        }

        const doc = new jsPDF();
        
        // Log form values for debugging
        console.log('Form Values:', {
            width: document.getElementById('width').value,
            height: document.getElementById('height').value,
            pixelPitch: document.getElementById('pixelPitch').value,
            usageType: document.getElementById('usageType').value,
            rentOrBuy: document.querySelector('input[name="rentOrBuy"]:checked').value
        });

        // Set initial coordinates
        let y = 20;
        
        // Add company branding
        doc.setFillColor(41, 128, 185); // Professional blue header
        doc.rect(0, 0, 220, 40, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text('LED Display Estimate', 15, 25);
        
        // Reset text color for rest of the document
        doc.setTextColor(0, 0, 0);
        
        // Add estimate details
        y = 50;
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Estimate Details:', 15, y);
        
        // Add estimate number and date
        doc.setFont(undefined, 'normal');
        doc.text(`Estimate #: EST-${Date.now().toString().slice(-6)}`, 15, y + 10);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 15, y + 20);
        
        // Client Information Section
        y = 90;
        doc.setFont(undefined, 'bold');
        doc.text('Client Information:', 15, y);
        doc.setFont(undefined, 'normal');
        doc.text('Company Name: ' + document.querySelector('[placeholder="Company Name"]').value, 15, y + 10);
        doc.text('Email: ' + document.querySelector('[placeholder="Email"]').value, 15, y + 20);
        doc.text('Phone: ' + document.querySelector('[placeholder="Phone"]').value, 15, y + 30);
        
        // Display Specifications
        y = 140;
        doc.setFont(undefined, 'bold');
        doc.text('Display Specifications:', 15, y);
        doc.setFont(undefined, 'normal');
        
        // Create specification table
        const specs = [
            ['Dimension', `${document.getElementById('width').value}ft × ${document.getElementById('height').value}ft`],
            ['Total Area', `${document.getElementById('width').value * document.getElementById('height').value} sq.ft`],
            ['Pixel Pitch', `${document.getElementById('pixelPitch').value}mm`],
            ['Usage Type', document.getElementById('usageType').value],
            ['Type', document.querySelector('input[name="rentOrBuy"]:checked').value]
        ];
        
        // Add rental duration if rental is selected
        if (document.querySelector('input[name="rentOrBuy"]:checked').value === 'rental') {
            specs.push(['Rental Duration', `${document.getElementById('duration').value} days`]);
        }
        
        doc.autoTable({
            startY: y + 10,
            head: [['Specification', 'Value']],
            body: specs,
            theme: 'grid',
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: [255, 255, 255]
            },
            styles: {
                cellPadding: 5
            },
            margin: { left: 15 }
        });
        
        // Selected Features Section
        y = doc.lastAutoTable.finalY + 20;
        doc.setFont(undefined, 'bold');
        doc.text('Selected Features:', 15, y);
        
        const features = [];
        if (document.getElementById('mounting').checked) features.push(['Mounting Structure', 'Yes']);
        if (document.getElementById('videoProcessor').checked) features.push(['Video Processor', 'Yes']);
        if (document.getElementById('delivery').checked) features.push(['Delivery/Installation', 'Yes']);
        if (document.getElementById('redundantPower').checked) features.push(['Redundant Power Supply', 'Yes']);
        if (document.getElementById('backupModules').checked) features.push(['Backup Modules', 'Yes']);
        if (document.getElementById('remoteControl').checked) features.push(['Remote Management System', 'Yes']);
        
        if (features.length > 0) {
            doc.autoTable({
                startY: y + 10,
                head: [['Feature', 'Included']],
                body: features,
                theme: 'grid',
                headStyles: {
                    fillColor: [41, 128, 185],
                    textColor: [255, 255, 255]
                },
                styles: {
                    cellPadding: 5
                },
                margin: { left: 15 }
            });
        }
        
        // Cost Breakdown
        y = doc.lastAutoTable.finalY + 20;
        doc.setFont(undefined, 'bold');
        doc.text('Cost Breakdown:', 15, y);
        
        const costs = calculateCostBreakdown();
        doc.autoTable({
            startY: y + 10,
            head: [['Item', 'Cost']],
            body: costs,
            theme: 'grid',
            headStyles: {
                fillColor: [41, 128, 185],
                textColor: [255, 255, 255]
            },
            styles: {
                cellPadding: 5
            },
            margin: { left: 15 }
        });
        
        // Total Cost
        y = doc.lastAutoTable.finalY + 10;
        doc.setFillColor(240, 240, 240);
        doc.rect(120, y, 75, 10, 'F');
        doc.setFont(undefined, 'bold');
        doc.text('Total Cost:', 125, y + 7);
        doc.text(`$${calculateTotalCost()}`, 170, y + 7);
        
        // Add Terms and Conditions
        y = y + 30;
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text('Terms & Conditions:', 15, y);
        doc.setFont(undefined, 'normal');
        const terms = [
            '1. Prices are valid for 30 days from the date of this estimate.',
            '2. Installation and delivery times may vary based on location.',
            '3. Warranty terms apply as per manufacturer specifications.',
            '4. Payment terms: 50% advance, 50% before delivery.'
        ];
        terms.forEach((term, index) => {
            doc.text(term, 15, y + 7 + (index * 5));
        });
        
        // Footer with company info
        doc.setFillColor(41, 128, 185);
        doc.rect(0, 272, 220, 25, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text('Event Expert | Address: 123 Business Street, City, Country', 15, 280);
        doc.text('Email: hello@eventexpert.com | Tel: 88888888888 | Website: www.eventexpert.com', 15, 285);
        doc.text('© 2024 Event Expert. All rights reserved.', 15, 290);
        
        console.log('PDF generated successfully'); // Debug log
        doc.save('LED_Display_Estimate.pdf');
    } catch (error) {
        console.error('Error generating PDF:', error);
    }
}

// Helper function to calculate cost breakdown
function calculateCostBreakdown() {
    const costs = [];
    const basePrice = calculateBasePrice(); // You'll need to implement this
    
    costs.push(['Base Display Cost', `$${basePrice.toFixed(2)}`]);
    
    if (document.getElementById('mounting').checked) {
        costs.push(['Mounting Structure', '$1,500.00']);
    }
    if (document.getElementById('videoProcessor').checked) {
        costs.push(['Video Processor', '$2,000.00']);
    }
    if (document.getElementById('delivery').checked) {
        costs.push(['Delivery/Installation', '$1,000.00']);
    }
    if (document.getElementById('redundantPower').checked) {
        costs.push(['Redundant Power Supply', '$800.00']);
    }
    if (document.getElementById('backupModules').checked) {
        costs.push(['Backup Modules', '$1,200.00']);
    }
    if (document.getElementById('remoteControl').checked) {
        costs.push(['Remote Management System', '$1,500.00']);
    }
    
    return costs;
}

// Helper function to calculate base price
function calculateBasePrice() {
    const width = parseFloat(document.getElementById('width').value);
    const height = parseFloat(document.getElementById('height').value);
    const pixelPitch = parseFloat(document.getElementById('pixelPitch').value);
    const usageType = document.getElementById('usageType').value;
    const isRental = document.querySelector('input[name="rentOrBuy"]:checked').value === 'rental';
    
    // Calculate area in square feet
    const area = width * height;
    
    // Base price per square foot based on pixel pitch
    let pricePerSqFt;
    switch(pixelPitch) {
        case 1.5:
            pricePerSqFt = 1000;
            break;
        case 2.9:
            pricePerSqFt = 800;
            break;
        case 4.0:
            pricePerSqFt = 600;
            break;
        default:
            pricePerSqFt = 800;
    }
    
    // Adjust price for indoor/outdoor
    if (usageType === 'outdoor') {
        pricePerSqFt *= 1.3; // 30% more for outdoor displays
    }
    
    // Calculate base price
    let basePrice = area * pricePerSqFt;
    
    // Adjust for rental vs purchase
    if (isRental) {
        const duration = parseInt(document.getElementById('duration').value) || 1;
        basePrice = (basePrice * 0.01) * duration; // 1% of purchase price per day
    }
    
    return basePrice;
}

// Helper function to calculate total cost
function calculateTotalCost() {
    let totalCost = calculateBasePrice();
    
    // Add costs for additional features
    if (document.getElementById('mounting').checked) {
        totalCost += 1500; // Mounting structure cost
    }
    if (document.getElementById('videoProcessor').checked) {
        totalCost += 2000; // Video processor cost
    }
    if (document.getElementById('delivery').checked) {
        totalCost += 1000; // Delivery/installation cost
    }
    if (document.getElementById('redundantPower').checked) {
        totalCost += 800; // Redundant power supply cost
    }
    if (document.getElementById('backupModules').checked) {
        totalCost += 1200; // Backup modules cost
    }
    if (document.getElementById('remoteControl').checked) {
        totalCost += 1500; // Remote management system cost
    }
    
    return totalCost.toFixed(2); // Return with 2 decimal places
}

// Add real-time cost update function
function updateTotalCost() {
    const totalCostElement = document.getElementById('totalCost');
    totalCostElement.textContent = `$${calculateTotalCost()}`;
}
