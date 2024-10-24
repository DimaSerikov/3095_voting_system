async function getVariants() {
  const response = await fetch('/variants');
  const variants = await response.json();

  const optionsDiv = document.getElementById('options');

  optionsDiv.innerHTML = '';

  Object.entries(variants).forEach(([key, data]) => {
    const button = document.createElement('button');

    Object.assign(button, {
      className: 'btn btn-primary m-2',
      textContent: data.text,
      onclick: () => vote(key)
    });
    
    button.style.backgroundColor = `#${key}`
    button.style.borderColor = `#${key}`

    optionsDiv.appendChild(button);
  });
}

async function getStats() {
  const response = await fetch('/stat', {method: 'POST'});

  return await response.json();
}

async function vote(code) {
  await fetch('/vote', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ code })
  });

  await renderChart();
}

let votingChart;

async function renderChart() {
  const backgroundColor = [];
  const borderColor = [];
  const dataLabels = [];
  const datasetsData = [];

  const stats = await getStats();

  Object.entries(stats).forEach(([key, data]) => {
    backgroundColor.push(`#${key}`);
    borderColor.push(`#${key}`)
    dataLabels.push(data.text)
    datasetsData.push(data.cnt)
  });

  const ctx = document.getElementById('myChart').getContext('2d');

  if (votingChart) {
    votingChart.destroy();
  }
  
  votingChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dataLabels,
      datasets: [{
        label: 'Number of Votes',
        data: datasetsData,
        backgroundColor,
        borderColor,
        borderWidth: 1
      }]
    },
    options: {
      plugins: {
        datalabels: {
          color: '#000',
          anchor: 'end',
          align: 'top',
          formatter: (value, context) => value,
        }
      },
      scales: {
        y: {
          beginAtZero: true,
        }
      }
    },
    plugins: [ChartDataLabels]
  });
}

async function downloadResults(format) {
  const response = await fetch('/results', {
    headers: {
      'Accept': format
    }
  });

  const content = await response.text();
  const blob = new Blob([content], { type: format });

  const link = document.createElement('a');

  const formatExtensions = {
    'application/json': 'json',
    'application/xml': 'xml',
    'text/html': 'html'
  };

  const extension = formatExtensions[format] || 'txt';
  const fileName = `voting_results_${Date.now()}.${format.split('/')[1]}.${extension}`;

  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
}

async function init() {
  await getVariants();
  await renderChart();
}

init();