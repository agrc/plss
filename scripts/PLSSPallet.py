#!/usr/bin/env python
# * coding: utf8 *
'''
PLSSPallet.py

A module that contains the pallet to update the mapserv.utah.gov/plss web app
'''

import arcpy
from forklift import seat
from forklift.models import Pallet
from os.path import join
from time import clock


class PlssPallet(Pallet):

    def __init__(self):
        super(PlssPallet, self).__init__()

        self.arcgis_services = [('PLSS', 'MapServer')]
        self.boundaries = join(self.staging_rack, 'boundaries.gdb')
        self.cadastre = join(self.staging_rack, 'cadastre.gdb')

        self.copy_data = [self.boundaries, self.cadastre]

    def build(self, configuration=None):
        self.add_crates(['PLSSPoint_AGRC'], {'source_workspace': join(self.garage, 'SGID.sde'), 'destination_workspace': self.cadastre})
        self.add_crates(['Counties'], {'source_workspace': join(self.garage, 'SGID.sde'), 'destination_workspace': self.boundaries})

    def process(self):
        start_seconds = clock()

        workspace = arcpy.env.workspace
        arcpy.env.workspace = self.cadastre

        self.log.debug('removing index')
        try:
            arcpy.RemoveIndex_management(in_table='PLSSPoint_AGRC', index_name='webquery')
        except Exception as e:
            self.log.warn('error removing PLSS index: %s', e)

        self.log.debug('adding index')
        try:
            arcpy.AddIndex_management(in_table='PLSSPoint_AGRC', fields='POINTID', index_name='webquery')
        except Exception as e:
            self.log.warn('error adding parcel index: %s', e)

        arcpy.env.workspace = workspace

        self.log.debug('finished PLSS processing %s', seat.format_time(clock() - start_seconds))
