import "./main.css";
import FingerprintJS from "@fingerprintjs/fingerprintjs";
import { shuffle } from "shuffle-seed";
import { Key } from "ts-key-enum";
import CPokedex, {
	Pokedex,
	Pokemon,
	PokemonSpecies,
} from "pokedex-promise-v2";
const P = new CPokedex();
import getDayOfYear from "date-fns/getDayOfYear";
import getDaysInYear from "date-fns/getDaysInYear";
import format from "date-fns/format";
import startOfDay from "date-fns/startOfDay";
import eachDayOfInterval from "date-fns/eachDayOfInterval";
import subDays from "date-fns/subDays";
import addDays from "date-fns/addDays";

type ResizableText = {
	element: JQuery<HTMLElement>;
	parent: JQuery<HTMLElement>;
};
type Dimensions = {
	height: number;
	width: number;
};

const fpPromise = FingerprintJS.load();

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
		if (clientX < width / 3) {
			// first third of screen
			rewindDay().catch(console.error);
		} else if (clientX > width - width / 3) {
			// last third of screen
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
}

async function advanceDay() {
	curDate = addDays(curDate, 1);
	await displayPokemon(curDate);
	resizeEntry();
}

async function rewindDay() {
	curDate = subDays(curDate, 1);
	await displayPokemon(curDate);
	resizeEntry();
}

async function displayPokemon(date: Date) {
	$("#day").text(format(curDate, "EEEE").toUpperCase());
	$("#date-string").text(format(curDate, "MMMM d").toUpperCase());
	$("#year").text(format(curDate, "y"));

	const pokemon = await dateToPokemon(date);

	$("#name").text(formatName(pokemon.pokemon.name));

	$("#sprite").attr(
		"src",
		pokemon.pokemon.sprites.other["official-artwork"].front_default
	);

	// this weird invisible char keeps showing up
	$("#entry").text(pokemon.flavorText.flavor_text.replace("", " "));
	resizeEntry();
	$("#ver").text(
		`(ver: ${pokemon.flavorText.version.name.replace("-", " ")})`
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

	// get the deterministic flavor text entry
	const englishFlavTexts = species.flavor_text_entries.filter((fText) => {
		return fText.language.name == "en";
	});
	const fp = await fpPromise;
	const flavorText = shuffle(englishFlavTexts, await fp.get())[0];

	return {
		pokemon,
		species,
		flavorText,
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

function resizeEntry() {
	resizeText({
		element: $("#entry")!,
		parent: $("#entry-box")!,
	});
}

function resizeText({ element, parent }: ResizableText) {
	const parentHeight = parent.height()!;
	let elementHeight = element.height()!;
	let fontSize = parseInt(element.css("font-size"));
	while (elementHeight < parentHeight) {
		fontSize++;
		element.css("font-size", `${fontSize}px`);
		elementHeight = element.height()!;
	}
	// TODO: Come up with an actual overflow detection method
	fontSize -= 4; // this is hacky af but it works a lot so far
	element.css("font-size", `${fontSize}px`);
}

const isOverflown = (
	{ clientHeight, clientWidth }: HTMLElement,
	{ height, width }: Dimensions
) => clientHeight > height || clientWidth > width;
