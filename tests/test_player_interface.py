import unittest

from course_game.player_interface import ACTIONS, PLAYER_ID, GardenDoorEpisode


class PlayerInterfaceTests(unittest.TestCase):
    def test_acceptance_trace_reaches_the_garden(self):
        # The acceptance trace in docs/rule-source-map.md.
        episode = GardenDoorEpisode()
        for action in ("east", "take key", "west", "unlock door", "north"):
            self.assertTrue(episode.step(PLAYER_ID, action)["accepted"], action)
        self.assertEqual(episode.outcome(), {"status": "terminal", "reason": "reached the garden",
                                             "score": 1, "steps": 5, "invalid_actions": 0})

    def test_legal_actions_at_start(self):
        self.assertEqual(GardenDoorEpisode().legal_actions(PLAYER_ID), ["look", "east"])

    def test_legal_actions_do_not_reveal_the_unseen_key(self):
        episode = GardenDoorEpisode()
        self.assertNotIn("take key", episode.legal_actions(PLAYER_ID))
        episode.step(PLAYER_ID, "east")
        self.assertIn("key", episode.observe(PLAYER_ID))
        self.assertIn("take key", episode.legal_actions(PLAYER_ID))

    def test_every_listed_action_is_in_the_vocabulary(self):
        episode = GardenDoorEpisode()
        for action in ("east", "take key", "west", "unlock door"):
            self.assertTrue(set(episode.legal_actions(PLAYER_ID)) <= set(ACTIONS))
            episode.step(PLAYER_ID, action)

    def test_illegal_action_is_refused_counted_and_changes_nothing(self):
        episode = GardenDoorEpisode()
        before = episode.observe(PLAYER_ID)
        result = episode.step(PLAYER_ID, "north")
        self.assertFalse(result["accepted"])
        self.assertEqual(episode.observe(PLAYER_ID), before)
        self.assertEqual(episode.outcome()["invalid_actions"], 1)
        self.assertEqual(episode.trace, [{"step": 1, "action": "north", "accepted": False}])

    def test_step_limit_ends_the_episode(self):
        episode = GardenDoorEpisode(max_steps=3)
        for _ in range(3):
            episode.step(PLAYER_ID, "look")
        self.assertEqual(episode.outcome()["reason"], "step limit")
        self.assertFalse(episode.step(PLAYER_ID, "east")["accepted"])
        self.assertEqual(episode.steps, 3)

    def test_no_actions_after_winning(self):
        episode = GardenDoorEpisode()
        for action in ("east", "take key", "west", "unlock door", "north"):
            episode.step(PLAYER_ID, action)
        self.assertEqual(episode.legal_actions(PLAYER_ID), [])
        self.assertFalse(episode.step(PLAYER_ID, "look")["accepted"])

    def test_observation_is_a_copy(self):
        episode = GardenDoorEpisode()
        episode.observe(PLAYER_ID)["room"] = "You are in the garden."
        self.assertEqual(episode.observe(PLAYER_ID)["room"], "You are in the hall.")

    def test_reset_starts_a_fresh_episode(self):
        episode = GardenDoorEpisode()
        episode.step(PLAYER_ID, "east")
        episode.reset(seed=7)
        self.assertEqual((episode.steps, episode.trace, episode.seed), (0, [], 7))
        self.assertEqual(episode.observe(PLAYER_ID)["room"], "You are in the hall.")

    def test_unknown_player_is_rejected(self):
        with self.assertRaises(ValueError):
            GardenDoorEpisode().observe("narrator")


if __name__ == "__main__":
    unittest.main()
