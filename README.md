# Public Lands Survey System (PLSS)

[![Push Events](https://github.com/agrc/plss/actions/workflows/push.yml/badge.svg)](https://github.com/agrc/plss/actions/workflows/push.yml)

## What is the PLSS

Section corners in the Public Land Survey System (PLSS) form the foundation for all descriptions of private property and public land boundaries in Utah. All legal property descriptions start from PLSS section corner markers, also known as monuments. Keeping the correct, precise location of these monuments accessible greatly reduces boundary discrepancies and disputes.

## What is a monument

Monuments are physical objects that mark the corners of the PLSS sections. The monuments are usually metal rods or brass disks in the ground. Each year hundreds of section corners that are used to determine property locations are in danger of being destroyed from land disturbances like new road projects, property development, and even conservation projects that rehabilitate vegetation after wild land and forest fires.

## Getting started

You can use this website to view the location of the monuments and the information about them. Navigate around the map and click on the PLSS points to see more information or to submit a monument record for that location. You will need to log in to submit a monument record.

## Development

### Run locally

1. `npm install`
2. `firebase login`
3. duplicate `.env` to `.env.local` and fill out the empty variables
4. duplicate `./funcions/.secret` to `./functions/.secret.local` and fill out the empty variables
5. `npm start`
6. Once everything is loaded, navigate to `http://localhost:5173/`
