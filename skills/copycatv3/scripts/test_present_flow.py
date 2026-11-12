#!/usr/bin/env python3
"""Behavioral checks of the evidence bridge, not an AE motion certification."""
import unittest
import present_flow as pf


class PresentFlowChecks(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data, cls.index = pf.load()

    def test_native_key_times_and_independent_drivers_survive(self):
        c = pf.contract(self.data, self.index, 7052)
        controls = {v['control']: v for v in c['controls'] if v['layer_index'] == 1}
        drivers = [v for v in controls.values() if v['evaluation_mode'] == 'keyframed']
        self.assertEqual({v['control'] for v in drivers},
                         {'Rotation Angle (degrees)', 'Appearance Progress', 'Pullback Progress'})
        self.assertEqual(controls['Rotation Angle (degrees)']['keys'][1]['time'], 0.687255859375)
        self.assertGreater(controls['Pullback Progress']['keys'][-1]['value'], 100)

    def test_text_progress_is_not_globally_clamped(self):
        c = pf.contract(self.data, self.index, 6971)
        progress = next(v for v in c['controls'] if v['control'] == 'Progress')
        self.assertEqual(progress['keys'][-1]['value'], 131)

    def test_expression_driven_zero_is_not_static(self):
        c = pf.contract(self.data, self.index, 82)
        progress = next(v for v in c['controls'] if v['control'] == 'Progress')
        self.assertEqual(progress['underlying_start_value'], 0)
        self.assertEqual(progress['evaluation_mode'], 'expression')
        self.assertTrue(progress['expression'])
        self.assertEqual(c['reference']['native_fps'], 60)

    def test_bad_and_partial_entries_cannot_be_exported_for_production(self):
        for comp_id, expected in [(707, 'quarantined'), (6897, 'needs_native_inspection')]:
            with self.assertRaises(ValueError):
                pf.contract(self.data, self.index, comp_id)
            diagnostic = pf.contract(self.data, self.index, comp_id, production=False)
            self.assertEqual(diagnostic['reference']['selection_status'], expected)
            self.assertTrue(diagnostic['known_issues'])

    def test_dependencies_do_not_become_independent_approved_templates(self):
        dep = next(c['id'] for c in self.data['comps'] if not c['approved'])
        with self.assertRaises(ValueError):
            pf.choose(self.data, dep)

    def test_all_family_members_resolve(self):
        expected = {i for ids in pf.FAMILIES.values() for i in ids}
        actual = {c['id'] for c in self.data['comps'] if c['approved']}
        self.assertEqual(actual, expected)

    def test_cadence_preserves_elapsed_time_at_24_and_60(self):
        collage = pf.sample_plan(pf.choose(self.data, 7052))
        title = pf.sample_plan(pf.choose(self.data, 82))
        self.assertEqual(collage['frame_count'], 26)
        self.assertEqual(title['frame_count'], 60)
        self.assertEqual(collage['samples'][1]['native_frame'], 2)
        self.assertEqual(title['samples'][1]['native_frame'], 5)
        self.assertAlmostEqual(title['samples'][12]['source_seconds'], 1)
        self.assertAlmostEqual(title['encoded_duration_seconds'], 5)

    def test_fractional_interval_is_not_silently_retimed(self):
        p = pf.sample_plan(pf.choose(self.data, 82), 0.11, 1.01)
        self.assertEqual(p['samples'][0]['source_seconds'], 0.11)
        self.assertEqual(p['frame_count'], 13)
        self.assertAlmostEqual(p['end_quantization_seconds'], 13 / 12 - 1.01)
        self.assertLess(p['samples'][-1]['source_seconds'], 1.12)
        for start, duration in [(-1, 1), (0, 0), (4, 2), (float('nan'), 1)]:
            with self.assertRaises(ValueError):
                pf.sample_plan(pf.choose(self.data, 82), start, duration)

    def test_sh22_clock_is_held_staggered_and_native(self):
        # Element 0 changes every four native frames. Element 1's 13-frame phase
        # is one modulo four, so it changes at native frame 3 rather than 4.
        self.assertEqual([round(pf.sh22_held_time(f/24, 0)*24) for f in range(9)],
                         [0, 0, 0, 0, 4, 4, 4, 4, 8])
        self.assertEqual([round(pf.sh22_held_time(f/24, 1)*24) for f in range(9)],
                         [0, 0, 0, 3, 3, 3, 3, 7, 7])
        self.assertAlmostEqual(pf.sh22_held_time(2/12, 0), 4/24)
        self.assertAlmostEqual(pf.sh22_held_time(2 + 4/24, 0, display_start=2), 2 + 4/24)

    def test_integrity_pass_does_not_erase_known_issues(self):
        report = pf.verify()
        self.assertEqual(report['package_integrity'], 'pass')
        self.assertTrue(report['success'])
        self.assertEqual(report['known_inspection_findings'], 9)
        self.assertEqual(report['strict_status'], 'fail')
        self.assertFalse(pf.verify(strict=True)['success'])


if __name__ == '__main__':
    unittest.main()
