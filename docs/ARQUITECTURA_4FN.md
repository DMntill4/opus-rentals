# DOCUMENTACIÓN TÉCNICA: NORMALIZACIÓN 4FN Y ARQUITECTURA HEXAGONAL

## 1. Justificación Matemática de la Cuarta Forma Normal (4FN)

Una relación $R$ está en **4FN** si y solo si, para cada dependencia multivaluada (MVD) no trivial $X \twoheadrightarrow Y$, $X$ es una superclave de $R$.

### Problema de Dependencias Multivaluadas Independientes:
Si una entidad posee dos o más atributos multivaluados independientes entre sí:
$$X \twoheadrightarrow Y \quad \text{y} \quad X \twoheadrightarrow Z \quad \text{donde} \quad Y \cap Z = \emptyset$$
almacenarlos en una misma relación genera redundancia de producto cartesiano y anomalías de inserción, actualización y borrado.

---

## 2. Casos Aplicados en Opus Rentals

### Caso 1: Herramientas vs Imágenes vs Especificaciones
- **Atributos**: `tool_id`, `image_url`, `spec_key`, `spec_value`.
- **Dependencias**:
  $$\text{tool\_id} \twoheadrightarrow \text{image\_url}$$
  $$\text{tool\_id} \twoheadrightarrow (\text{spec\_key}, \text{spec\_value})$$
- Una fotografía de una retroexcavadora no tiene ninguna relación funcional con que tenga 24.8 HP de potencia.
- **Descomposición 4FN**:
  1. `tools(id, provider_id, category_id, name, brand, model, daily_price, deposit_amount, status)`
  2. `tool_images(id, tool_id, image_url, is_cover)`
  3. `tool_specifications(id, tool_id, spec_key, spec_value)`

### Caso 2: Proveedores vs Contactos vs Zonas de Cobertura
- **Atributos**: `provider_id`, `contact_type`, `contact_value`, `state`, `city`.
- **Dependencias**:
  $$\text{provider\_id} \twoheadrightarrow (\text{contact\_type}, \text{contact\_value})$$
  $$\text{provider\_id} \twoheadrightarrow (\text{state}, \text{city})$$
- Un teléfono comercial no está ligado exclusivamente a una ciudad de cobertura.
- **Descomposición 4FN**:
  1. `providers(id, user_id, company_name, tax_id, address, rating)`
  2. `provider_contacts(id, provider_id, contact_type, contact_value)`
  3. `provider_coverage_zones(id, provider_id, state, city)`

### Caso 3: Devoluciones vs Daños Reportados
- **Atributos**: `rental_id`, `return_date`, `general_notes`, `inspector_notes`, `damage_description`, `severity`, `penalty_amount`.
- **Descomposición 4FN**:
  1. `rental_returns(id, rental_id, return_date, status, general_notes, inspector_notes)`
  2. `rental_damages(id, return_id, description, severity, penalty_amount)`

---

## 3. Matriz de Entidades Normalizadas (16 Tablas)

1. `roles`
2. `users`
3. `clients`
4. `providers`
5. `provider_contacts` (4FN)
6. `provider_coverage_zones` (4FN)
7. `tool_categories`
8. `tools`
9. `tool_images` (4FN)
10. `tool_specifications` (4FN)
11. `rentals`
12. `rental_returns`
13. `rental_damages` (4FN)
14. `invoices`
15. `payment_methods`
16. `payments`
