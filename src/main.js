const setupTable = (tableWrapper, repositoryName) => {
	tableWrapper.innerHTML = `
	<div id="readme" class="Box md js-code-block-container Box--responsive">
    	<!--<div class="Box-header d-flex flex-items-center flex-justify-between bg-white border-bottom-0">
			<h2 class="Box-title pr-3">
				README.md
			</h2>
		</div> -->
		<div class="Box-body px-5 pb-5">
			<article class="markdown-body entry-content container-lg">
				<h2>Forks of ${repositoryName}</h2>
				<table class="rich-diff-level-zero mt-4" id="enhanced-forks-table">
					<thead class="rich-diff-level-one">
						<tr>
							<th>Fork</th>
							<th>Created at</th>
							<th>Last push at</th>
							<th>Stars</th>
						</tr>
					</thead>
					<tbody class="rich-diff-level-one">
					</tbody>
				</table>
			</article>
		</div>
    </div>
	`;
	const table = tableWrapper.querySelector('table')
	return table;
}

const fillTable = (table, forks) => {
	const tbody = table.querySelector('tbody');
	for (fork of forks) {
		const tr = document.createElement("tr");
		tr.innerHTML = `
			<td>
				<a href="${fork.author_page_url}">${fork.author_name }</a>
				/ 
				<a href="${fork.repository_url}">${fork.repository_name}</a>
			</td>
			<td>${fork.created_at.toLocaleDateString()}</td>
			<td>${fork.last_push_at.toLocaleDateString()}</td>
			<td>${fork.stars}</td>
		`;
		tbody.appendChild(tr);
	}
}


chrome.extension.sendMessage({}, function(response) {
	var readyStateCheckInterval = setInterval(function() {
	if (document.readyState === "complete") {
		console.log("Hello. This message was sent from scripts/inject.js");
		const repositoryName = document.URL.match(/(?<=github\.com\/).*(?=\/network)/g);
		const network_tab = document.querySelector('#network');
		const table = setupTable(network_tab, repositoryName);
		fetch(`https://api.github.com/repos/${repositoryName}/forks?sort=stargazers&per_page=100`)
			.then(function(response) 
			{
				if (response.status !== 200) {
					console.error('Looks like there was a problem loading the forks data. Status Code: ' + response.status);
					return;
				}
				
				response.json().then(function(data) {
					const forks = data.map(fork => {
						return {
							'repository_name': fork.name,
							'repository_url': `https://github.com/${fork.owner.login}/${fork.name}`,
							'author_name': fork.owner.login,
							'author_avatar_url': fork.owner.avatar_url,
							'author_page_url': fork.owner.url,
							'stars': fork.stargazers_count,
							'created_at': new Date(fork.created_at),
							'last_push_at': new Date(fork.pushed_at),
						};
					});
					fillTable(table, forks);
					//network_tab.innerHTML = 
					// ProTable.fromArray('#network', [
					// 	{
					// 	  name: 'Nurul Huda',
					// 	  relationship: 'Married',
					// 	  blog: 'https://jagongoding.com'
					// 	},
					// 	{
					// 	  name: 'Abdullah Wahid',
					// 	  city: 'Bangkalan'
					// 	},
					// 	{
					// 	  city: 'Lamongan',
					// 	  name: 'Lendis Fabri',
					// 	  blog: 'https://kopiding.in'
					// 	},
					// 	{
					// 	  name: 'Elmo Bachtiar',
					// 	  relationship: 'Single'
					// 	}
					//   ])
					  
					// debugger;
				});
			})
			.catch(function(err) {
				console.log('Fetch Error :-S', err);
			});

		clearInterval(readyStateCheckInterval);
	}
	}, 10);
});