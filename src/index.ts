import "./main.css";
import { shuffle } from "shuffle-seed";
import { Key } from "ts-key-enum";
import CPokedex, {
	Pokedex,
	Pokemon,
	PokemonSpecies,
	PokemonSpeciesFlavorTextEntry,
} from "pokedex-promise-v2";
const P = new CPokedex();
import getDayOfYear from "date-fns/getDayOfYear";
import getDaysInYear from "date-fns/getDaysInYear";
import format from "date-fns/format";
import startOfDay from "date-fns/startOfDay";
import eachDayOfInterval from "date-fns/eachDayOfInterval";
import subDays from "date-fns/subDays";
import addDays from "date-fns/addDays";

// initialize globals
const DAY_BUFFER_SIZE = 7; // curDay inclusive
const DAYS_BEHIND = Math.ceil(DAY_BUFFER_SIZE / 2 - 1);
const DAYS_AHEAD = Math.trunc(DAY_BUFFER_SIZE / 2);
let curDate = startOfDay(new Date());
const body = $("#main");

// set up controls
document.onkeydown = (ev) => {
	switch (ev.key) {
		case Key.ArrowRight:
			advanceDay().catch(console.error);
			break;
		case Key.ArrowLeft:
			rewindDay().catch(console.error);
			break;
	}
};
document.onclick = (ev) => {
	const { clientX } = ev;
	const width = body.innerWidth();

	if (width) {
		if (clientX < width / 2) {
			rewindDay().catch(console.error);
		} else {
			advanceDay().catch(console.error);
		}
	} else {
		console.warn("Window width could not be determined!");
	}
};

// initialize calendar
initialize()
	.then(() => {
		console.log("Calendar initialized!");
	})
	.catch((err) => {
		console.error(err);
	});

async function initialize() {
	await displayPokemon(curDate);

	// cache pokemon in interval around current date
	const daysBuffer = eachDayOfInterval({
		start: subDays(curDate, DAYS_BEHIND),
		end: addDays(curDate, DAYS_AHEAD),
	});

	for (const day of daysBuffer) {
		// fetch the pokemon so the cache can catch it
		await dateToPokemon(day);
	}
}

async function advanceDay() {
	curDate = addDays(curDate, 1);
	await displayPokemon(curDate);

	// cache one more day out
	await dateToPokemon(addDays(curDate, DAYS_AHEAD));
}

async function rewindDay() {
	curDate = subDays(curDate, 1);
	await displayPokemon(curDate);

	// cache one more day behind
	await dateToPokemon(subDays(curDate, DAYS_BEHIND));
}

async function displayPokemon(date: Date) {
	$("#day").text(format(curDate, "EEEE").toUpperCase());
	$("#date-string").text(format(curDate, "MMMM d").toUpperCase());
	$("#year").text(format(curDate, "y"))

	const pokemon = await dateToPokemon(date);

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
	$("#ver").text(`(ver: ${flavTextEntry.version.name.replace("-", " ")})`);

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
}

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

	// request sprite for caching
	const url = pokemon.sprites.other["official-artwork"].front_default;
	if (url) {
		await fetch(url, { method: "GET", mode: "no-cors" });
	}

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
