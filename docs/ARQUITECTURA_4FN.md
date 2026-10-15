# TECHNICAL DOCUMENTATION: 4NF NORMALIZATION AND HEXAGONAL ARCHITECTURE

## 1. MATHEMATICAL PROOF OF FOURTH NORMAL FORM (4NF)

A relation $R$ is in **Fourth Normal Form (4NF)** if and only if, for every non-trivial Multivalued Dependency (MVD) $X \twoheadrightarrow Y$, $X$ is a superkey of $R$.

### Multivalued Dependency Problem
When an entity holds two or more independent multivalued attributes:
$$X \twoheadrightarrow Y \quad \text{and} \quad X \twoheadrightarrow Z \quad \text{where} \quad Y \cap Z = \emptyset$$
storing them in a single table forces a Cartesian product of tuples, causing insertion, deletion, and update anomalies.

---

## 2. APPLIED CASES IN OPUS RENTALS

### Case 1: Equipment vs Images vs Technical Specifications
- **Attributes**: `tool_id`, `image_url`, `spec_key`, `spec_value`.
- **Dependencies**:
  $$\text{tool\_id} \twoheadrightarrow \text{image\_url}$$
  $$\text{tool\_id} \twoheadrightarrow (\text{spec\_key}, \text{spec\_value})$$
- A photograph of an excavator has no functional correlation with its engine output or operating weight.
- **4NF Normalized Decomposition**:
  1. `tools(id, provider_id, category_id, name, brand, model, daily_price, deposit_amount, status)`
  2. `tool_images(id, tool_id, image_url, is_cover)`
  3. `tool_specifications(id, tool_id, spec_key, spec_value)`

### Case 2: Providers vs Contact Channels vs Operational Zones
- **Attributes**: `provider_id`, `contact_type`, `contact_value`, `state`, `city`.
- **Dependencies**:
  $$\text{provider\_id} \twoheadrightarrow (\text{contact\_type}, \text{contact\_value})$$
  $$\text{provider\_id} \twoheadrightarrow (\text{state}, \text{city})$$
- A corporate telephone or email has no functional dependence on a specific delivery city or municipality.
- **4NF Normalized Decomposition**:
  1. `providers(id, user_id, company_name, tax_id, address, rating)`
  2. `provider_contacts(id, provider_id, contact_type, contact_value)`
  3. `provider_coverage_zones(id, provider_id, state, city)`

### Case 3: Returns vs Documented Damage Items
- **Attributes**: `rental_id`, `return_date`, `general_notes`, `inspector_notes`, `damage_description`, `severity`, `penalty_amount`.
- **Dependencies**:
  $$\text{return\_id} \twoheadrightarrow (\text{description}, \text{severity}, \text{penalty\_amount})$$
- A physical inspection certificate may record multiple unrelated damages, each carrying distinct severity ratings and individual replacement penalties.
- **4NF Normalized Decomposition**:
  1. `rental_returns(id, rental_id, return_date, status, general_notes, inspector_notes)`
  2. `rental_damages(id, return_id, description, severity, penalty_amount)`

---

## 3. FULL RELATIONAL SCHEMA MATRIX (16 TABLES)

1. `roles`: Master table for authorization scopes (`ROLE_ADMIN`, `ROLE_PROVIDER`, `ROLE_CLIENT`).
2. `users`: Credentials, status, and encrypted password hashes.
3. `clients`: Customer details and tax identity identifiers.
4. `providers`: Heavy machinery suppliers and contractor companies.
5. `provider_contacts`: Decoupled multi-channel contact points (4NF).
6. `provider_coverage_zones`: Decoupled operational territories (4NF).
7. `tool_categories`: Machine taxonomy and fleet grouping.
8. `tools`: Heavy equipment catalog, daily rates, and status.
9. `tool_images`: Multi-image gallery and cover identification (4NF).
10. `tool_specifications`: Key-value engineering parameters (4NF).
11. `rentals`: Contractual reservations, scheduled dates, and status lifecycle.
12. `rental_returns`: Reception physical audit records.
13. `rental_damages`: Itemized damage assessments and penalties (4NF).
14. `invoices`: Fiscal billing records with itemized 19% VAT.
15. `payment_methods`: Approved payment instruments.
16. `payments`: Payment gateway audit transactions.
