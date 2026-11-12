"""Contract regression tests; does not claim to test generative visual quality."""
import copy
import json
from pathlib import Path
import struct
import tempfile
import unittest
import zlib
import reference_post as rp


def tiny_png():
    def chunk(kind, data):
        return struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data))
    return (b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', 1, 1, 8, 2, 0, 0, 0))
            + chunk(b'IDAT', zlib.compress(b'\x00\x10\x20\x30')) + chunk(b'IEND', b''))


class ContractTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.path = Path(self.temp.name)
        self.payload = rp.read_json(rp.ROOT/'examples/test-trigger.json')
        self.payload.update(width=1, height=1)
        self.payload['post_media_caption'] = 'Exact caption.\nAttribution stays.  '
        for name in ('reference.png', 'asset.png'):
            (self.path/name).write_bytes(tiny_png())
        for name, value in [('caption', self.payload['post_media_caption']), ('first_reply', ''), ('attribution', '')]:
            (self.path/f'{name}.txt').write_bytes(value.encode())
        (self.path/'comparison.html').write_text('<p>Fixture evidence</p>')
        ch = rp.sha_text(self.payload['post_media_caption'])
        ah = rp.sha_file(self.path/'asset.png')
        self.job = {'job_key': 'fixture', 'input_sha256': rp.canonical_sha(self.payload),
                    'caption_sha256': ch, 'reference_sha256': rp.sha_file(self.path/'reference.png')}
        self.result = {'status':'ready_for_review','job_key':'fixture','caption_sha256':ch,
                       'reference_sha256':self.job['reference_sha256'],
                       'output':{'path':'asset.png','sha256':ah,'width':1,'height':1},
                       'comparison':'comparison.html','selection':{'fixture':True},
                       'replacements':['fixture'],
                       'review':{'output_sha256':ah,'checks':dict.fromkeys(rp.CHECKS, True),
                                 'observations':'Synthetic fixture, not an actual creative review'}}
        self.save()

    def save(self):
        for name, data in [('input.json',self.payload),('job.json',self.job),('result.json',self.result)]:
            rp.write_json(self.path/name, data)

    def test_complete_record_passes_integrity_only(self):
        self.assertTrue(rp.verify(self.path)['ready_for_review'])

    def test_caption_whitespace_change_is_detected(self):
        (self.path/'caption.txt').write_text(self.payload['post_media_caption'].strip())
        self.assertIn('Caption changed', rp.verify(self.path)['errors'])

    def test_failed_visual_review_cannot_be_ready(self):
        self.result['review']['checks']['texture_preserved'] = False
        self.save()
        self.assertFalse(rp.verify(self.path)['ready_for_review'])

    def test_edited_output_invalidates_old_review(self):
        (self.path/'asset.png').write_bytes(tiny_png()+b'changed')
        self.assertIn('Output or review hash is stale', rp.verify(self.path)['errors'])

    def test_different_dimensions_block(self):
        self.result['output']['width'] = 1200
        self.save()
        self.assertFalse(rp.verify(self.path)['ready_for_review'])

    def test_simulated_production_is_rejected(self):
        self.payload['mode']='production'
        with self.assertRaisesRegex(ValueError,'simulated'):
            rp.validate_payload(self.payload)

    def test_missing_caption_does_not_fall_back_to_topic(self):
        del self.payload['post_media_caption']
        with self.assertRaisesRegex(ValueError,'post_media_caption'):
            rp.validate_payload(self.payload)

    def test_reference_tampering_is_detected(self):
        (self.path/'reference.png').write_bytes(tiny_png()+b'changed')
        self.assertIn('Reference has changed',rp.verify(self.path)['errors'])

    def test_video_is_not_certified_by_static_check(self):
        self.payload['kind']='video'
        self.job['input_sha256']=rp.canonical_sha(self.payload)
        self.save()
        self.assertIn('Static verifier cannot certify motion fidelity',rp.verify(self.path)['errors'])

    def test_known_visual_mechanism_is_retrievable(self):
        result=rp.shortlist('cascading headline thumbnail',3)
        self.assertEqual((result[0]['video'],result[0]['shot']),('B44-05',25))


if __name__=='__main__':
    unittest.main()
