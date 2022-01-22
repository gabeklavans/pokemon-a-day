import "./main.css";
import { shuffle } from "shuffle-seed";
import {} from "date-fns";
import CPokedex, {
	Pokedex,
	Pokemon,
	PokemonSpecies,
	PokemonSpeciesFlavorTextEntry,
} from "pokedex-promise-v2";
import getDayOfYear from "date-fns/getDayOfYear";
import getDaysInYear from "date-fns/getDaysInYear";
import format from "date-fns/format";
import startOfDay from "date-fns/startOfDay";
const P = new CPokedex();

import { registerRoute } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";

// ====Workbox====
registerRoute(
	new RegExp(
		"^https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork"
	),
	new CacheFirst({
		cacheName: "images",
		plugins: [
			new CacheableResponsePlugin({
				statuses: [0, 200],
			}),
		],
	})
);

registerRoute(
	new RegExp("pokeapi.co/api"),
	new CacheFirst({
		cacheName: "pokeapi",
		plugins: [
			new CacheableResponsePlugin({
				statuses: [0, 200],
			}),
		],
	})
);

// initialize globals
let curDate = startOfDay(new Date());

// initialize calendar
$("#day").text(format(curDate, "EEEE").toUpperCase());
$("#date-string").text(format(curDate, "MMMM d").toUpperCase());

dateToPokemon(curDate)
	.then((pokemon) => {
		$("#name").text(formatName(pokemon.pokemon.name));

		$("#sprite").attr(
			"src",
			pokemon.pokemon.sprites.other["official-artwork"].front_default
		);

		const englishFlavTexts = pokemon.species.flavor_text_entries.filter(
			(fText) => {
				return fText.language.name == "en";
			}
		);
		const flavTextEntry =
			sample<PokemonSpeciesFlavorTextEntry>(englishFlavTexts);
		// this weird invisible char keeps showing up
		$("#entry").text(flavTextEntry.flavor_text.replace("", " "));
		$("#ver").text(
			`(ver: ${flavTextEntry.version.name.replace("-", " ")})`
		);

		$("#type").text(
			formatNoun(
				pokemon.pokemon.types.map((type) => type.type.name).join("/")
			)
		);

		const genus = pokemon.species.genera.find(
			(genus) => genus.language.name == "en"
		)?.genus;
		if (genus) {
			$("#category").text(formatNoun(genus));
		}

		$("#height").text(pokemon.pokemon.height / 10.0 + " m");

		$("#weight").text(pokemon.pokemon.weight / 10.0 + " kg");
	})
	.catch((e) => {
		console.error(e);
	});

async function dateToPokemon(date: Date) {
	// create list of all ids
	const numPokemon = ((await P.getPokedexByName("national")) as Pokedex)
		.pokemon_entries.length;
	const dexidList = Array(numPokemon + 1)
		.fill(0)
		.map((_, i) => i)
		.splice(1);

	// get random order of IDs seeded by the year
	const yearStr = date.getFullYear().toString();
	const randomDexIds = shuffle(dexidList, yearStr).slice(
		0,
		getDaysInYear(date)
	);
	const dexId = randomDexIds[getDayOfYear(date) - 1];

	const pokemon = (await P.getPokemonByName(dexId)) as Pokemon;
	const species = (await P.getPokemonSpeciesByName(dexId)) as PokemonSpecies;

	return {
		pokemon,
		species,
	};
}

function formatName(str: string) {
	let tokens = str.split("-");

	return tokens.join(" ").toLocaleUpperCase();
}

function formatNoun(str: string) {
	return str[0].toLocaleUpperCase() + str.slice(1).toLocaleLowerCase();
}

function sample<T>(arr: T[]): T {
	return arr[Math.floor(Math.random() * arr.length)];
}

console.log("Hi");
