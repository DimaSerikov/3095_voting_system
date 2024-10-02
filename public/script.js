async function getVariants() {
  const response = await fetch('/3095_voting_system/variants');
  const variants = await response.json();

  const optionsDiv = document.getElementById('options');

  optionsDiv.innerHTML = '';
  
  variants.forEach((variant) => {

    const button = document.createElement('button');

    button.classList.add('btn', 'btn-primary', 'm-2');
    button.textContent = variant.text;
    button.style.backgroundColor = variant.text
    button.style.borderColor = variant.text
    button.onclick = () => vote(variant.code);

    optionsDiv.appendChild(button);
  });
}

async function getStats() {
  const response = await fetch('/3095_voting_system/stat', {method: 'POST'});

  return await response.json();
}

async function vote(code) {
  await fetch('/3095_voting_system/vote', {
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

  const stats = await getStats();

  for (const [code, count] of Object.entries(stats)) {
    backgroundColor.push(`#${code}`);
    borderColor.push(`#${code}`)
  }

  const ctx = document.getElementById('myChart').getContext('2d');

  if (votingChart) {
    votingChart.destroy();
  }

  votingChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(stats),
      datasets: [{
        label: 'Number of Votes',
        data: Object.values(stats),
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

getVariants();
renderChart();