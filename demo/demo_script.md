# Demo Script: Adaptive Hiring Agent

## Act 1: The First Interaction
1. **Action**: Start a new session for "Alex Rivera".
2. **Observation**: The agent asks a standard technical question (e.g., "Explain REST vs GraphQL").
3. **Action**: Provide a weak answer regarding "Rate Limiting".
4. **Outcome**: The `Evaluator` flags this as a **Weakness**. The `HindsightService` persists this.

## Act 2: The Evolution (Session 3)
1. **Action**: Fast-forward (mentally or via mock) to Session 3.
2. **Observation**: Notice the Sidebar now shows "Rate Limiting" under **Known Weak Areas**.
3. **Agent Behavior**: The agent says: *"I noticed last time we spoke that rate limiting was a bit unclear. Let's dive deeper—how would you implement a token bucket algorithm in a distributed system?"*
4. **Insight**: This shows the **Adaptive Memory** in action.

## Act 3: The Runtime Intelligence (Cost Visualization)
1. **Action**: Toggle the "Runtime Intelligence" dashboard.
2. **Observation**: Show the model distribution chart. 
3. **Point**: *"See how 80% of questions went to Qwen? We only escalated to the premium model for that last system design question. We've saved $4.50 just in this demo."*

## Act 4: The Reflection
1. **Action**: Click "End Session".
2. **Observation**: Show the "Reflection" output.
3. **Point**: *"The agent has now identified a pattern: Alex is strong in API design but weak in distributed state. It has automatically updated his preparation roadmap."*
