# TransitChain — Multimodal Routing & Optimization Engine

## 1. Research Question Addressed

> **"Can multi-objective route optimization produce more practical journeys than minimizing travel time alone?"**

Traditional single-objective routing algorithms (such as standard Dijkstra or single-criterion A*) solely minimize travel time. However, in urban public transit:
- A journey that is 3 minutes faster but involves 2 km of walking in heat or 3 chaotic transfers is rarely practical.
- A direct bus that takes 45 minutes may be substantially preferred by passengers over a complex multi-transfer journey taking 41 minutes.
- Passengers with budget priorities want to know if taking a direct ordinary bus (₹25) saves money compared to taking an express metro interchange (₹60).

TransitChain solves this by evaluating a **5-dimensional Pareto frontier**:
1. $f_1$: Total Journey Duration ($T_{\text{total}}$)
2. $f_2$: Total Walking Duration ($T_{\text{walk}}$)
3. $f_3$: Transfer Count ($N_{\text{transfers}}$)
4. $f_4$: Total Fare in INR ($C_{\text{fare}}$)
5. $f_5$: Waiting Duration ($T_{\text{wait}}$)

## 2. Pareto Dominance Definition

A journey alternative $A$ dominates alternative $B$ ($A \prec B$) if and only if:
$$\forall i \in \{1..5\}, f_i(A) \le f_i(B) \quad \text{and} \quad \exists j \in \{1..5\}, f_j(A) < f_j(B)$$

All non-dominated journeys form the **Pareto Optimal Set**.

## 3. Preference-Weighted Normalized Scoring

For ranking alternatives in user-facing listings, TransitChain normalizes each metric across the candidate set and computes a user-customized composite score:

$$\text{Score} = \sum_{k} w_k \cdot \frac{f_k - \min(f_k)}{\max(f_k) - \min(f_k) + \epsilon}$$

### Preset Weight Distributions:
- **Balanced**: Duration 35%, Walking 20%, Transfers 20%, Fare 15%, Waiting 10%
- **Fastest**: Duration 60%, Walking 15%, Transfers 10%, Fare 5%, Waiting 10%
- **Lowest Fare**: Fare 55%, Duration 15%, Walking 10%, Transfers 10%, Waiting 10%
- **Fewest Transfers**: Transfers 50%, Duration 20%, Walking 10%, Fare 10%, Waiting 10%
- **Least Walking**: Walking 50%, Duration 20%, Transfers 15%, Waiting 10%, Fare 5%

## 4. Origin-First Timetable Search

Instead of running an exhaustive full-network scan across tens of thousands of GTFS stop times:
1. Origin & Destination Resolution: Identify stops within walking radius $R_{\text{walk}}$ (default $\le 2000$m) from coordinates.
2. Timetable Expansion: Query boardable departures after user arrival at stop $t_{\text{board}} \ge t_{\text{origin\_dep}} + t_{\text{walk\_to\_stop}}$.
3. Downstream Trace: For candidate trips, load only downstream stop times.
4. Transfer Link Graph: At interchange stops (e.g. Raidurg, Ameerpet, KPHB), expand verified transfer edges with minimum transfer buffers (180s) and walking transfer times.
5. Destination Matching: Collect complete chains reaching destination stops, append final walking leg, and evaluate Pareto dominance.
