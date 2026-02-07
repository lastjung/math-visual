# Directive: Example Scraping SOP

This is a Standard Operating Procedure for scraping a website.

## Goal

Extract the main title and core features from a target URL.

## Inputs

- `url`: The full URL of the website to scrape.

## Tools

- `execution/scrape_single_site.py`

## Expected Output

- A markdown file in `.tmp/` containing the extracted data.

## Edge Cases

- If the site is behind a CAPTCHA, report to user.
- If the site returns 404, log the error in `.tmp/error.log`.
