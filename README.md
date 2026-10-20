# Outdoor E-commerce

A full-stack e-commerce application for camping and outdoor equipment, built as a portfolio project with a focus on realistic shopping workflows, maintainable architecture, accessibility, and production-minded engineering practices.

> **Project status:** Early development. The repository foundation has been established. Features described as planned below are not necessarily implemented yet.

## Project Overview

Outdoor E-commerce aims to provide a realistic online shopping experience for outdoor enthusiasts, with a catalog covering camping and hiking essentials.

The project is designed to demonstrate practical full-stack development skills, including application architecture, database modeling, authentication, cart management, order processing, and responsive user interface development.

## Planned Features

### Customer Experience

- Browse products and view product details, pricing, and stock information.
- Search and filter products by category.
- Add products to a shopping cart as a guest or authenticated user.
- Merge guest cart items into the user's account after signing in.
- Register, sign in, and sign out.
- Complete a simulated checkout.
- View order details and order status.

### Administration

- Create, update, and manage product listings.
- Review customer orders and related information.
- Enforce valid order status transitions.
- Restrict administrative operations to authorized users.

### Product Categories

- Tents and Shelters
- Backpacks and Packs
- Camp Kitchen
- Outdoor Apparel

### Checkout and Payments

Checkout is intended to simulate a realistic purchasing workflow. Real payment processing and the collection or storage of payment-card details are outside the project's scope.

## Technology Stack

The current technical direction includes:

- **Framework:** Next.js with the App Router
- **UI Library:** React
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** Better Auth

Installed package versions, available scripts, and final configuration are defined by the repository's source files and configuration.

## Getting Started

Setup instructions will be finalized once the application scripts, environment variables, database configuration, and authentication setup have been verified.

The expected local development workflow is:

1. Install a compatible Node.js version.
2. Install dependencies using the package manager configured for the project.
3. Configure the required environment variables using the documented example file, when available.
4. Start a local PostgreSQL database and apply the project's documented database migrations.
5. Run the development server using the appropriate script in `package.json`.

Refer to the project configuration for the exact commands and prerequisites. Do not assume the application can run until its required services and environment variables are configured.

## Development Principles

The project follows these engineering principles:

- Maintain a clear separation of responsibilities.
- Prefer small, reviewable changes.
- Validate changes before considering them complete.
- Build accessible interfaces using semantic HTML and appropriate interaction patterns.
- Keep secrets and environment-specific configuration out of source control.
- Document significant architectural decisions.
- Distinguish planned features from implemented and verified functionality.

## Project Status

Development is incremental. Feature completion should be reported only after implementation and appropriate validation.

Screenshots, a live demo, test instructions, and deployment details will be added when they are available and verified.

## Repository

[GitHub Repository](https://github.com/parham-tech/outdoor-ecommerce)

## License

No license has been declared yet. Until a license is added, no permission to reuse, modify, or redistribute this project should be assumed.
