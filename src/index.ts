import "./main.css";
import CPokedex, { Pokemon, PokemonSpecies } from "pokedex-promise-v2";
const P = new CPokedex();

const NUM_POKEMON = 898;

dateToPokemon(new Date())
	.then((pokemon) => {
		const name = $("#name") as JQuery<HTMLHeadingElement>;
		name.text(formatName(pokemon.pokemon.name));

		const sprite = $("#sprite") as JQuery<HTMLImageElement>;
		sprite.attr(
			"src",
			pokemon.pokemon.sprites.other["official-artwork"].front_default
		);

		const entry = $("#entry") as JQuery<HTMLParagraphElement>;
		entry.text(pokemon.species.flavor_text_entries[0].flavor_text);
	})
	.catch((e) => {
		console.error(e);
	});

async function dateToPokemon(date: Date) {
	// replace with hash func
	// const pokemonsList = await P.getPokemonsList();
	const id = Math.floor(Math.random() * NUM_POKEMON);
	// console.log(pokemonsList.count);

	const pokemon = (await P.getPokemonByName(id)) as Pokemon;
	const species = (await P.getPokemonSpeciesByName(id)) as PokemonSpecies;

	return {
		pokemon,
		species,
	};
}

function formatName(str: string) {
	let tokens = str.split("-");
	tokens = tokens.map((token) => {
		return token[0].toUpperCase() + token.slice(1).toLowerCase();
	});

	return tokens.join(" ");
}

console.log("Hi");
