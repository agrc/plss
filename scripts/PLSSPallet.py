#!/usr/bin/env python
# * coding: utf8 *
'''
PLSSPallet.py

A module that contains the pallet to update the mapserv.utah.gov/plss web app
'''

from forklift.models import Pallet
from os.path import join


class PlssPallet(Pallet):

    def __init__(self):
        super(PlssPallet, self).__init__()

        # self.arcgis_services = [('PLSS', 'MapServer')]
        self.destination_workspace = 'C:\\Scheduled\\Staging\\Cadastre.gdb'
        self.copy_data = [self.destination_workspace]
        self.destination_coordinate_system = 26912

    def build(self, configuration=None):
        self.add_crates(['PLSSPoint_AGRC', 'Counties'], {'source_workspace': join(self.garage, 'SGID10.sde'),
                                                         'destination_workspace': self.destination_workspace})
