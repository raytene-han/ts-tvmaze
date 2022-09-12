import axios from "axios";
import * as $ from 'jquery';

const $showsList = $("#showsList");
const $episodesArea = $("#episodesArea");
const $episodesList = $("#episodesList");
const $searchForm = $("#searchForm");

const BASE_URL = 'https://api.tvmaze.com';

interface ShowInterface {
  id: number,
  name: string,
  summary: string,
  image: {medium: string} | null
}

interface EpisodeInterface {
  id: number,
  name: string,
  season: string,
  number: string
}

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term: string): Promise<ShowInterface[]> {
  // ADD: Remove placeholder & make request to TVMaze search shows API.
  const response = await axios.get(`${BASE_URL}/search/shows`, {params: {q: term}});
  return response.data.map((showInfo: {show: ShowInterface}) => {
    return {id: showInfo.show.id,
            name: showInfo.show.name,
            summary: showInfo.show.summary,
            image: showInfo.show.image?.medium ||'https://tinyurl.com/tv-missing' }});

}


/** Given list of shows, create markup for each and to DOM */

function populateShows(shows: ShowInterface[]) {
  $showsList.empty();

  for (let show of shows) {

    const $show = $(
        `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src="${show.image}"
              alt="Bletchly Circle San Francisco"
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary">${show.name}</h5>
             <div><small>${show.summary}</small></div>
             <button class="btn btn-outline-light btn-sm Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);

    $showsList.append($show);  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val() as string;
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}
/** handleClick for searching for shows  */
async function handleSubmit(evt: JQuery.SubmitEvent): Promise<void> {
  evt.preventDefault();
  await searchForShowAndDisplay();
}

$searchForm.on("submit", handleSubmit);

/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id: number): Promise<EpisodeInterface[]> {
  const response = await axios.get(`${BASE_URL}/shows/${id}/episodes`);
  return response.data.map((episodeInfo: EpisodeInterface) => {
    return {id: episodeInfo.id,
            name: episodeInfo.name,
            season: episodeInfo.season,
            number: episodeInfo.number}});
 }

/** Givin an array  [EpisodeInterface, ...],
 * populate the dom
 */

function populateEpisodes(episodes: EpisodeInterface[]) {
  $episodesList.empty();

  for (let episode of episodes) {
    const $episode = $(
        `<li>${episode.name} (season ${episode.season}, number ${episode.number})</li>
      `);

    $episodesList.append($episode);  }

  $episodesArea.show();
 }


/** Click handler for get episodes button
 */
async function handleEpisodesClick(evt: JQuery.ClickEvent): Promise<void> {
  const id = $(evt.target).closest(".Show").data("show-id")
  const episodes = await getEpisodesOfShow(id)

  populateEpisodes(episodes)




}

$showsList.on("click", ".Show-getEpisodes",  handleEpisodesClick);